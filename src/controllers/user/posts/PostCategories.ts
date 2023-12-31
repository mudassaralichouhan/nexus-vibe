import {Request, Response} from "express";
import prisma from "../../../../prisma";
import {validate} from "../../../helpers/joi";
import Joi from "joi";
import {putFile} from "../../../helpers/file-upload";

const POST_CATEGORIES_IMAGE_UPLOAD_PATH = 'post-categories-images';
export const SLUG_PATTERN = /^[a-z0-9-]+$/

export const index = async (request: Request, response: Response) => {
  const {skip, take} = request.query;

  try {
    const parsedSkip = typeof skip === 'string' ? parseInt(skip, 10) : 0;
    const parsedTake = typeof take === 'string' ? parseInt(take, 10) : 15;

    const totalCount = await prisma.categories.count();

    const posts = await prisma.categories.findMany({
      skip: parsedSkip,
      take: parsedTake,
    });

    const totalPages = Math.ceil(totalCount / parsedTake);

    const paginationInfo = {
      total: totalCount,
      per_page: parsedTake,
      current_page: Math.ceil((parsedSkip + 1) / parsedTake),
      last_page: totalPages,
      from: parsedSkip,
      to: Math.min(parsedSkip + parsedTake, totalCount),
    };

    const responsePayload = {
      data: posts,
      meta: {
        pagination: paginationInfo,
      },
    };

    return response.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error during fetching posts index:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const createOrUpdate = async (request: Request, response: Response) => {
  try {
    const body = await validate({
      slug: Joi
        .string()
        .required()
        .pattern(SLUG_PATTERN),
      name: Joi.string()
        .required()
        .min(3)
        .max(255),
      detail: Joi
        .string()
        .allow(null)
        .min(10)
        .max(255)
    }, request.body);

    if (body) return response.status(422).json(body.messages);

    // Create a new post category
    const postCategories = await prisma.categories.upsert({
      where: {
        slug: request.body.slug,
      },
      update: {
        name: request.body.name,
        detail: request.body.detail,
      },
      create: {
        slug: request.body.slug,
        name: request.body.name,
        detail: request.body.detail,
      },
    })

    if (request.files?.image) {
      const file = await putFile(
        `${POST_CATEGORIES_IMAGE_UPLOAD_PATH}/${postCategories.id}`,
        request.files?.image,
        5 * 1024 * 1024,
        [
          'image/jpeg',
          'image/jpg',
          'image/png',
        ]);

      await prisma.categories.update({
        where: {
          id: postCategories.id,
        },
        data: {
          image: file.info?.path,
        }
      })
    }

    return response.status(201).json(postCategories);
  } catch (error) {
    console.error('Error during post creation:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const destroy = async (request: Request, response: Response) => {
  try {
    const {id} = request.params;

    // Check if categoryId is provided
    if (id.length !== 24) {
      return response.status(422).json({error: 'ID representation must be exactly 12 bytes: ' + id});
    }

    // Delete the post category
    await prisma.categories.delete({
      where: {
        id: id,
      },
    });

    return response.status(204).end(); // 204 No Content for a successful deletion
  } catch (error) {
    console.error('Error during post category deletion:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const checkExistingSlugs = async (categorySlugs: string[]) => {
  try {
    // Check if any of the category slugs already exist
    return await prisma.categories.findMany({
      where: {
        slug: {
          in: categorySlugs,
        },
      },
      select: {
        id: true,
        slug: true,
      },
    });
  } catch (error) {
    console.error('Error during slug existence check:', error);
  } finally {
    await prisma.$disconnect();
  }
};
