import {Request, Response} from "express";
import prisma from "../../../../prisma";
import {validate} from "../../../helpers/joi";
import Joi from "joi";
import {SLUG_PATTERN} from "./PostCategories";

export const index = async (request: Request, response: Response) => {
  const {skip, take} = request.query;

  try {
    const parsedSkip = typeof skip === 'string' ? parseInt(skip, 10) : 0;
    const parsedTake = typeof take === 'string' ? parseInt(take, 10) : 15;

    const totalCount = await prisma.tags.count();

    const posts = await prisma.tags.findMany({
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
    console.error('Error during fetching tag index:', error);
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
    }, request.body);

    if (body) return response.status(422).json(body.messages);

    // Create a new post category
    const tag = await prisma.tags.upsert({
      where: {
        slug: request.body.slug,
      },
      update: {
        slug: request.body.slug,
      },
      create: {
        slug: request.body.slug,
      },
    })

    return response.status(201).json(tag);
  } catch (error) {
    console.error('Error during tag creation:', error);
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
    await prisma.tags.delete({
      where: {
        id: id,
      },
    });

    return response.status(204).end(); // 204 No Content for a successful deletion
  } catch (error) {
    console.error('Error during post tag deletion:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const checkExistingTagSlugs = async (tagSlugs: string[]) => {
  try {
    // Check if any of the category slugs already exist
    return await prisma.tags.findMany({
      where: {
        slug: {
          in: tagSlugs,
        },
      },
      select: {
        slug: true,
        id: true,
      },
    });
  } catch (error) {
    console.error('Error during slug existence check:', error);
  } finally {
    await prisma.$disconnect();
  }
};
