/*
 *
 */

import {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import {validate} from '../../helpers/joi';
import prisma from "../../../prisma";
import {DAY, joiEmail, PASSWORD_MIN_LEN} from "../../config/constants";
import {generateSessionId, getRefreshToken} from "../../services/auth-token-service";
import Joi from "joi";
import {generateOTP} from "../../helpers/numbers";
import {sendMail} from "../../helpers/mailer";

export const login = async (request: Request, response: Response) => {
  try {
    const body = await validate({
      email: joiEmail,
      password: Joi
        .string()
        .trim()
        .required()
        .min(PASSWORD_MIN_LEN)
        .max(32)
    }, request.body);

    if (body) return response.status(422).json(body.messages)

    // Use Prisma to find the user based on the provided email
    const user = await prisma.users.findUnique({
      where: {
        email: request.body?.email,
        role: 'USER',
      },
    });

    if (!user)
      return response.status(404).json({error: 'User not found'});

    // Check if the provided password matches the user's password
    // (you might want to use a more secure method for password verification)
    if (user && await bcrypt.compare(request.body.password, user.password)) {
      user.password = undefined;
      const accessToken = await generateSessionId(user.id, user.role);
      const refreshToken = await getRefreshToken(user.id, user.role);

      return response.status(200).json({user, accessToken, refreshToken});
    }

    return response.status(400).json({message: 'Username or Password is invalid'});
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
        .trim()
        .required()
        .min(2)
        .max(25)
        .pattern(/^[a-zA-Z\s]+$/, {name: 'alpha', invert: false})
        .messages({
          'string.pattern.base': 'Name must contain only letters and spaces',
        }),
      email: joiEmail,
      password: Joi.string()
        .trim()
        .required()
        .min(PASSWORD_MIN_LEN)
        .max(32)
        .valid(Joi.ref('repeat_password'))
        .messages({
          'any.only': 'Passwords do not match',
        }),
      repeat_password: Joi.string(),
      terms: Joi
        .boolean()
        .required()
    }, request.body)

    if (body) return response.status(422).json(body.messages);

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
        role: 'USER',
      },
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

export const resetPassword = async (request: Request, response: Response) => {
  try {
    // Validate the request body
    const body = await validate({
      email: joiEmail,
      otp: Joi.string()
        .trim()
        .required()
        .min(4)
        .max(4),
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

    // Use Prisma to find the password reset record based on the provided email and token
    let lastDay = new Date(Date.now() - DAY);
    const passwordReset = await prisma.passwordResets.findUnique({
      where: {
        email: request.body.email,
        token: request.body.otp,
        createdAt: {
          gte: lastDay,
        }
      },
    });

    if (!passwordReset) {
      // Password reset record not found or invalid
      return response.status(404).json({error: 'Invalid or expired reset token'});
    }

    // Update the user's password in the database
    await prisma.users.update({
      where: {
        email: request.body.email,
      },
      data: {
        password: await bcrypt.hash(request.body.password, 10),
      },
    });

    // Delete the password reset record as it's no longer needed
    await prisma.passwordResets.delete({
      where: {
        email: request.body.email,
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
        role: "USER",
      },
    });

    if (!user)
      return response.status(404).json({error: 'User not found'});

    const OTP = generateOTP().toString();

    await prisma.passwordResets.upsert({
      where: {
        email: user.email,
      },
      update: {
        token: OTP,
      },
      create: {
        email: user.email,
        token: OTP,
      },
    })

    await sendMail({
      to: request.body.email,
      subject: "Forgot your password OTP ✔",
      text: "Hello?",
      html: `<b>Hello ${user.name} your OTP is: ${OTP}</b>`,
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
        .min(PASSWORD_MIN_LEN)
        .max(32),
      password: Joi
        .string()
        .trim()
        .required()
        .min(PASSWORD_MIN_LEN)
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

