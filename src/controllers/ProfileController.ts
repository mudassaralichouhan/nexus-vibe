import {Request, Response} from 'express';

import {validate} from "../helpers/joi";
import Joi from "joi";
import prisma from "../../prisma";
import {deleteFile, putFile} from "../helpers/file-upload";
import {PROFILE_COVER_PHOTO_UPLOAD_PATH, PROFILE_PHOTO_UPLOAD_PATH} from "./admin/ProfileController";

export const update = async (request: Request, response: Response) => {
  const {bio, about, street, city, country, gender, relationship} = request.body;
  const decodedToken = request['decodedToken'];

  try {
    const body = await validate({
      bio: Joi.string().allow(null).max(255),
      about: Joi.string().allow(null).max(500),
      street: Joi.string().allow(null).max(50),
      city: Joi.string().allow(null).max(15),
      country: Joi.string().allow(null).max(10),
      gender: Joi.valid('MALE', 'FEMALE', 'NONE'),
      relationship: Joi.valid('MARRIED', 'SINGLE'),
    }, request.body);

    if (body) return response.status(422).json(body.messages);

    console.log(gender)
    // Update the user profile
    const updatedProfile = await prisma.userProfiles.upsert({
      where: {
        userId: decodedToken.id,
      },
      create: {
        userId: decodedToken.id,
        bio: bio,
        about: about,
        gender: gender?.toUpperCase(),
        relationship: relationship.toUpperCase(),
      },
      update: {
        bio: bio,
        about: about,
        gender: gender?.toUpperCase(),
        relationship: relationship?.toUpperCase(),
      },
    });

    const updatedAddress = await prisma.userAddress.upsert({
      where: {
        userId: decodedToken.id,
      },
      create: {
        userId: decodedToken.id,
        street: street,
        city: city,
        country: country,
      },
      update: {
        street: street,
        city: city,
        country: country,
      },
    });

    return response.status(200).json({...updatedAddress, ...updatedProfile});
  } catch (error) {
    console.error('Error during profile update:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const show = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];

  try {
    const findOrCreate = await prisma.userProfiles.upsert({
      where: {
        userId: decodedToken.id,
      },
      create: {
        userId: decodedToken.id
      },
      update: {},
    });

    const updatedAddress = await prisma.userAddress.upsert({
      where: {
        userId: decodedToken.id,
      },
      create: {
        userId: decodedToken.id,
      },
      update: {
      },
    });

    return response.status(200).json({...updatedAddress, ...findOrCreate});
  } catch (error) {
    console.error('Error during fetching user profile:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const photo = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];

  try {
    const file = await putFile(
      `${PROFILE_PHOTO_UPLOAD_PATH}/${decodedToken.id}`,
      request.files?.photo,
      5 * 1024 * 1024,
      [
        'image/jpeg',
        'image/jpg',
        'image/png',
      ]);
    if (file.error) return response.status(422).json({message: file.message});

    const updatedProfile = await prisma.userProfiles.upsert({
      where: {
        userId: decodedToken.id,
      },
      create: {
        userId: decodedToken.id,
        photo: file.info.path,
      },
      update: {
        photo: file.info.path,
      },
    });

    return response.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error during user profile photo uploading:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const coverPhoto = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];

  try {
    const file = await putFile(
      `${PROFILE_COVER_PHOTO_UPLOAD_PATH}/${decodedToken.id}`,
      request.files?.photo,
      5 * 1024 * 1024,
      [
        'image/jpeg',
        'image/jpg',
        'image/png',
      ]);
    if (file.error) return response.status(422).json({message: file.message});

    const updatedProfile = await prisma.userProfiles.upsert({
      where: {
        userId: decodedToken.id,
      },
      create: {
        userId: decodedToken.id,
        coverPhoto: file.info.path,
      },
      update: {
        coverPhoto: file.info.path,
      },
    });

    return response.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error during user coverPhoto uploading:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const rmPhoto = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];
  try {

    const isDeleted = await deleteFile(`${PROFILE_PHOTO_UPLOAD_PATH}/${decodedToken.id}`);

    if (isDeleted) {
      const updatedProfile = await prisma.userProfiles.upsert({
        where: {
          userId: decodedToken.id,
        },
        create: {
          userId: decodedToken.id,
          photo: null,
        },
        update: {
          photo: null,
        },
      });
    }

    return response.status(200).json({
      status: isDeleted,
    });
  } catch (error) {
    console.error('Error during user rmPhoto:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const rmCoverPhoto = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];
  try {

    const isDeleted = await deleteFile(`${PROFILE_COVER_PHOTO_UPLOAD_PATH}/${decodedToken.id}`);

    if (isDeleted) {
      const updatedProfile = await prisma.userProfiles.upsert({
        where: {
          userId: decodedToken.id,
        },
        create: {
          userId: decodedToken.id,
          coverPhoto: null,
        },
        update: {
          coverPhoto: null,
        },
      });
    }

    return response.status(200).json({
      status: isDeleted,
    });
  } catch (error) {
    console.error('Error during user rmCoverPhoto:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const follow = async (request: Request, response: Response) => {

};

export const UnFollow = async (request: Request, response: Response) => {

};
