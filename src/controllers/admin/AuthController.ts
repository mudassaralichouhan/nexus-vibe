import {Request, Response} from 'express';
import bcrypt from "bcrypt";
import prisma from "../../../prisma";
import {validate} from "../../helpers/joi";
import {sendMail} from "../../helpers/mailer";
import * as fs from 'fs/promises';
import * as path from 'path';
import {DAY, joiEmail, MIN, PASSWORD_MIN_LEN} from "../../config/constants";
import {generateSessionId, getRefreshToken} from "../../services/auth-token-service";
import {redisClient} from "../../services/redis-service";
import Joi from "joi";
import {decrypt, encrypt} from "../../helpers/crypto";
import {baseURL} from "../../helpers/url";
import {generateOTP} from "../../helpers/numbers";

export const ROLES = {
  admin: 'ADMIN',
  user: 'USER',
}

interface ResetPasswordInfoType {
  url: string
  name: string
  email: string
}

export const login = async (request: Request, response: Response) => {
  try {
    const body = await validate({
      email: joiEmail,
      password: Joi
        .string()
        .trim()
        .min(PASSWORD_MIN_LEN + 2)
        .max(32),
      otp: Joi
        .number()
        .integer()
        .min(1111)
        .max(9999),
      remember: Joi
        .boolean(),
    }, request.body);

    if (body) return response.status(422).json(body.messages)

    const u = await redisClient.get(request.body.email)
    if (u && request.body?.otp) {
      const user = JSON.parse(u)

      if (user.otp == request.body.otp) {

        const accessToken = await generateSessionId(user.id, user.role);
        let refreshToken = null
        if (request.body.remember)
          refreshToken = await getRefreshToken(user.id, user.role);

        const filePath = path.join(__dirname, 'login-email-template.html');
        const content = await fs.readFile(filePath, 'utf-8');

        await sendMail({
          to: request.body.email,
          subject: "You are login ✔",
          text: `You are login success fully ${user.name}`,
          html: content,
        });

        redisClient.del(user.email)
        return response.status(200).json({user, accessToken, refreshToken});
      }

      return response.status(400).json({error: 'Verification code sent on your mail not match'});
    }

    // Use Prisma to find the user based on the provided email
    const user = await prisma.users.findUnique({
      where: {
        email: request.body.email,
        role: "ADMIN",
        verifyAt: {
          not: null,
        },
      },
    });

    if (!user)
      return response.status(404).json({error: 'User not found or not verified'});

    // Check if the provided password matches the user's password
    // (you might want to use a more secure method for password verification)
    if (user && await bcrypt.compare(request.body.password, user.password)) {
      user.password = undefined;

      const verificationCode = generateOTP();
      user['otp'] = verificationCode
      const data = JSON.stringify(user);
      await redisClient.del(user.email);
      await redisClient.set(user.email, data, 'EX', MIN);
      await sendMail({
        to: request.body.email,
        subject: "Login OTP ✔",
        text: 'Login verification',
        html: `Your verification code is: ${verificationCode}`,
      });

      return response.status(200).json({message: 'Verification code sent on your mail'});
    }

    return response.status(400).json({error: 'Username or Password is invalid'});
  } catch (error) {
    console.error('Error during login:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    // Close the Prisma client to release the connection
    await prisma.$disconnect();
  }
};

export const register = async (request: Request, response: Response) => {
  const {email, password, name} = request.body;

  try {
    const body = await validate({
      name: Joi.string()
        .required()
        .min(1)
        .max(25)
        .pattern(/^[a-zA-Z\s]+$/, {name: 'alpha', invert: false})
        .messages({
          'string.pattern.base': 'Name must contain only letters and spaces',
        }),
      email: joiEmail,
      password: Joi.string()
        .trim()
        .required()
        .min(PASSWORD_MIN_LEN + 2)
        .max(32)
        .valid(Joi.ref('repeat_password'))
        .messages({
          'any.only': 'Passwords do not match',
        }),
      repeat_password: Joi.string(),
      terms: Joi.valid(true).required()
    }, request.body)

    if (body) return response.status(422).json(body.messages);

    // Check if an ADMIN user already exists
    const adminExists = await prisma.users.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (adminExists) {
      // Admin already exists
      return response.status(409).json({error: 'Admin already exists; please contact an admin for new creations.'});
    }

    // Check if a user with the provided email already exists
    const existingUser = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      // User already exists
      return response.status(409).json({error: 'User with this email already exists.'});
    }

    const salt = await bcrypt.genSalt(10);

    // Create a new user
    const newUser = await prisma.users.create({
      data: {
        email: email,
        password: await bcrypt.hash(password, salt),
        name: name,
        role: "ADMIN",
        verifyAt: null,
      },
    });
    const filePath = path.join(__dirname, 'register-email-template.html');
    const content = await fs.readFile(filePath, 'utf-8');

    const token = encrypt(JSON.stringify({
      email: newUser.email,
      id: newUser.id,
      expireAt: Date.now(),
    }));

    const registerAdminUserInfo: ResetPasswordInfoType = {
      url: `${baseURL(request)}/api/auth/register/verified?token=${token}`,
      name: newUser.name,
      email: newUser.email,
    };

    await sendMail({
      to: request.body.email,
      subject: "You are register ✔",
      text: `You are register success fully ${newUser.name}`,
      html: content.replace('{{VERIFIED_URL}}', registerAdminUserInfo.url)
        .replace('{{NAME}}', registerAdminUserInfo.name)
        .replace('{{EMAIL}}', registerAdminUserInfo.email),
    });

    // Successful registration
    newUser.password = undefined;
    return response.status(201).json(newUser);
  } catch (error) {
    console.error('Error during registration:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    // Close the Prisma client to release the connection
    await prisma.$disconnect();
  }
};

export const registerVerification = async (request: Request, response: Response) => {
  const token: string = request.query?.token as string;

  if (token === '') {
    return response.status(404).json({error: 'Invalid token'});
  }

  try {
    const decryptToken = JSON.parse(decrypt(token));

    if (!decryptToken?.email) {
      return response.status(404).json({error: 'Invalid or expired url'});
    }

    const exist = await prisma.users.count({
      where: {
        email: decryptToken.email,
        verifyAt: null,
      }
    })

    if (!exist) {
      return response.status(200).json({error: 'Already verified'});
    } else {
      // Update the user's password in the database
      await prisma.users.update({
        where: {
          email: decryptToken.email,
          verifyAt: null,
        },
        data: {
          verifyAt: new Date(),
        },
      });
    }

    return response.status(200).json({message: 'Register verified'});
  } catch (error) {
    console.error('Error during register verification reset:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    // Close the Prisma client to release the connection
    await prisma.$disconnect();
  }
};

export const resetPassword = async (request: Request, response: Response) => {
  const token: string = request.query?.token as string;

  try {
    // Validate the request body
    const body = await validate({
      password: Joi
        .string()
        .trim()
        .required()
        .min(PASSWORD_MIN_LEN + 2)
        .max(32)
        .valid(Joi.ref('repeat_password'))
        .messages({
          'any.only': 'Passwords do not match',
        }),
      repeat_password: Joi.string(),
    }, request.body);

    if (body) return response.status(422).json(body.messages);

    const decryptToken = JSON.parse(decrypt(token));

    // Use Prisma to find the password reset record based on the provided email and token
    let lastDay = new Date(Date.now() - DAY);
    const passwordReset = await prisma.passwordResets.findUnique({
      where: {
        email: decryptToken.email,
        token: token.toString(),
        createdAt: {
          gte: lastDay,
        }
      },
    });

    if (!passwordReset) {
      return response.status(404).json({error: 'Invalid or expired reset token'});
    }

    // Update the user's password in the database
    await prisma.users.update({
      where: {
        email: decryptToken.email,
      },
      data: {
        password: await bcrypt.hash(request.body.password, 10),
      },
    });

    // Delete the password reset record as it's no longer needed
    await prisma.passwordResets.delete({
      where: {
        email: decryptToken.email,
      },
    });

    return response.status(200).json({message: 'Password reset successful'});
  } catch (error) {
    console.error('Error during password reset:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    // Close the Prisma client to release the connection
    await prisma.$disconnect();
  }
};

export const forgotPassword = async (request: Request, response: Response) => {

  try {
    // Validate the email format
    const body = await validate({
      email: joiEmail,
    }, request.body);

    if (body) return response.status(422).json(body.messages);

    // Use Prisma to find the user based on the provided email
    const user = await prisma.users.findUnique({
      where: {
        email: request.body.email,
        role: "ADMIN",
      },
    });

    if (!user)
      return response.status(404).json({error: 'User not found'});

    const token = encrypt(JSON.stringify({
      email: user.email,
      id: user.id,
      expireAt: Date.now(),
    }));

    await prisma.passwordResets.upsert({
      where: {
        email: user.email,
      },
      update: {
        token: token,
      },
      create: {
        email: user.email,
        token: token,
      },
    })

    // Get the HTML content from the reset password form file
    const resetPasswordInfo: ResetPasswordInfoType = {
      url: `${baseURL(request)}/api/auth/password/reset?token=${token}`,
      name: user.name,
      email: user.email,
    };
    const resetPasswordFormContent = await getResetPasswordFormContent(resetPasswordInfo);

    await sendMail({
      to: request.body.email,
      subject: "Forgot your reset password ✔",
      text: "Hello?",
      html: resetPasswordFormContent,
    });

    return response.status(200).json({message: 'Password reset link sent successfully'});
  } catch (error) {
    console.error('Error during forgot password:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    // Close the Prisma client to release the connection
    await prisma.$disconnect();
  }
};

export const passwordChange = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];

  try {
    // Validate the new password format
    const body = await validate({
      new_password: Joi
        .string()
        .trim()
        .required()
        .min(PASSWORD_MIN_LEN + 2)
        .max(32),
      password: Joi
        .string()
        .trim()
        .required()
        .min(PASSWORD_MIN_LEN + 2)
        .max(32)
        .valid(Joi.ref('repeat_password'))
        .messages({
          'any.only': 'Passwords do not match',
        }),
      repeat_password: Joi.string(),
    }, request.body);

    if (body) return response.status(422).json(body.messages);

    // Use Prisma to find the user based on the provided user ID
    const user = await prisma.users.findUnique({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      // User not found
      return response.status(404).json({error: 'User not found'});
    }

    // Check if the provided current password matches the user's current password
    if (!await bcrypt.compare(request.body.new_password, user.password)) {
      // Current password is invalid
      return response.status(400).json({error: 'Current password is incorrect'});
    }

    // Generate a new salt and hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(request.body.new_password, salt);

    // Update the user's password in the database
    await prisma.users.update({
      where: {
        id: decodedToken.id,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    return response.status(200).json({message: 'Password changed successfully'});
  } catch (error) {
    console.error('Error during password change:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    // Close the Prisma client to release the connection
    await prisma.$disconnect();
  }
};

async function getResetPasswordFormContent(resetPasswordInfo: ResetPasswordInfoType): Promise<string> {
  const filePath = path.join(__dirname, 'reset-password-form.html');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.replace('{{RESET_PASSWORD_LINK}}', resetPasswordInfo.url)
      .replace('{{NAME}}', resetPasswordInfo.name)
      .replace('{{EMAIL}}', resetPasswordInfo.email);
  } catch (error) {
    console.error(`Error reading file: ${filePath}`);
    throw error;
  }
}
