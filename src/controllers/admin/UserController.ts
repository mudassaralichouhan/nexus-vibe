import {Request, Response} from 'express';
import bcrypt from "bcrypt";
import prisma from "../../../prisma";

export const show = async (request: Request, response: Response) => {
  const id = request.params.id;

  try {
    // Fetch the user profile
    const userProfile = await prisma.userProfiles.findUnique({
      where: {
        userId: id,
      },
    });

    if (!userProfile) {
      return response.status(404).json({error: 'User profile not found'});
    }

    return response.status(200).json(userProfile);
  } catch (error) {
    console.error('Error during fetching user profile:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const resetProfile = async (request: Request, response: Response) => {
  const id = request.params.id;

  try {
    // Update the user profile
    const updatedProfile = await prisma.userProfiles.upsert({
      where: {
        userId: id,
      },
      create: {
        userId: id,
        photo: null,
        coverPhoto: null,
        bio: null,
        about: null,
        relationship: null,
      },
      update: {
        photo: null,
        coverPhoto: null,
        bio: null,
        about: null,
        relationship: null,
      },
    });

    const updatedAddress = await prisma.userAddress.upsert({
      where: {
        userId: id,
      },
      create: {
        userId: id,
        street: null,
        city: null,
        country: null,
      },
      update: {
        street: null,
        city: null,
        country: null,
      },
    });

    return response.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error during resetProfile:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const resetPassword = async (request: Request, response: Response) => {
  const id = request.params.id;

  try {
    const user = await prisma.users.findUnique({
      where: {
        id: id,
      },
    });

    if (user) {
      user.password = undefined
    } else {
      return response.status(404).json({message: "No such user exists"});
    }

    // Use Prisma to find the password reset record based on the provided email and token
    const passwordReset = await prisma.passwordResets.findUnique({
      where: {
        email: user.email,
      },
    });

    // Update the user's password in the database
    await prisma.users.update({
      where: {
        id: id,
      },
      data: {
        password: await bcrypt.hash(request.body.password, 10),
      },
    });

    // Delete the password reset record as it's no longer needed
    await prisma.passwordResets.delete({
      where: {
        email: user.email,
      },
    });

    return response.status(200).json({message: 'Password reset successful'});
  } catch (error) {
    console.error('Error during resetPassword by admin:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    // Close the Prisma client to release the connection
    await prisma.$disconnect();
  }
}

export const deactivate = async (request: Request, response: Response) => {
  const id = request.params.id;

  try {

    return response.status(200).json({message: 'user deactivate successfully'});
  } catch (error) {
    console.error('Error during deactivate by admin:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    // Close the Prisma client to release the connection
    await prisma.$disconnect();
  }
};
