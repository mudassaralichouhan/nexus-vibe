import {Request, Response} from "express";
import prisma from "../../../../prisma";
import {validate} from "../../../helpers/joi";
import Joi from "joi";
import {deleteFile, putFile} from "../../../helpers/file-upload";

const POST_IMAGE_UPLOAD_PATH = 'post-images';

export const index = async (request: Request, response: Response) => {
  const {skip, take} = request.query;
  const decodedToken = request['decodedToken'];

  try {
    const parsedSkip = typeof skip === 'string' ? parseInt(skip, 10) : 0;
    const parsedTake = typeof take === 'string' ? parseInt(take, 10) : 15;

    const totalCount = await prisma.posts.count({
      where: {
        userId: decodedToken.id,
      },
    });

    const posts = await prisma.posts.findMany({
      skip: parsedSkip,
      take: parsedTake,
      where: {
        userId: decodedToken.id,
      },
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

export const show = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];

  try {
    // Check if the post exists for the specified user
    const post = await prisma.posts.findFirst({
      where: {
        id: request.params.id,
        userId: decodedToken.id,
      },
      include: {
        postCategories: {
          select: {
            id: false,
            postId: false,
            category: true,
          },
        },
        postTags: {
          select: {
            id: false,
            postId: false,
            tag: true,
          }
        },
        likes: true,
        comments: true,
      },
    });

    if (!post) {
      return response.status(404).end();
    }
    
    return response.status(200).json(post);
  } catch (error) {
    console.error('Error during fetching post details:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const create = async (request: Request, response: Response) => {
  const {title, description} = request.body;
  const decodedToken = request['decodedToken'];

  try {

    const body = await validate({
      title: Joi.string()
        .trim()
        .required()
        .min(1)
        .max(255),
      description: Joi.string()
        .trim()
        .allow(null)
        .min(10)
        .max(255)
    }, request.body);

    if (body) return response.status(422).json(body.messages);

    // Create a new post
    const newPost = await prisma.posts.create({
      data: {
        title,
        description,
        userId: decodedToken.id,
      },
    });

    const file = await putFile(
      `${POST_IMAGE_UPLOAD_PATH}/${newPost.id}`,
      request.files?.image,
      5 * 1024 * 1024,
      [
        'image/jpeg',
        'image/jpg',
        'image/png',
      ]);

    const updateImgPost = await prisma.posts.update({
      where: {
        id: newPost.id,
      },
      data: {
        image: file?.info?.path
      },
    });

    return response.status(201).json({data: updateImgPost});
  } catch (error) {
    console.error('Error during post creation:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const update = async (request: Request, response: Response) => {
  const postId = request.params.id;
  const decodedToken = request['decodedToken'];
  const {title, description} = request.body;

  try {
    // Check if the post exists
    const existingPost = await prisma.posts.findFirst({
      where: {id: postId, userId: decodedToken.id},
    });

    if (!existingPost)
      return response.status(404).json({error: 'Post not found'});

    // Validate the request body
    const body = await validate({
      title: Joi.string()
        .trim()
        .required()
        .min(1)
        .max(255),
      description: Joi.string()
        .trim()
        .allow(null)
        .min(10)
        .max(255),
    }, request.body);

    if (body) return response.status(422).json(body.messages);

    // Update the post
    const updatedPost = await prisma.posts.update({
      where: {
        id: postId,
      },
      data: {
        title,
        description,
      },
    });

    return response.status(200).json({data: updatedPost});
  } catch (error) {
    console.error('Error during post update:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};


export const destroy = async (request: Request, response: Response) => {
  const postId = request.params.id;
  const decodedToken = request['decodedToken'];

  try {
    // Check if the post exists
    const existingPost = await prisma.posts.findFirst({
      where: {id: postId, userId: decodedToken.id},
    });

    if (!existingPost)
      return response.status(404).json({error: 'Post not found'});

    // Delete the post
    await prisma.posts.delete({
      where: {
        id: postId,
      },
    });

    // If the post had an image, you may want to delete the associated file as well
    if (existingPost.image) {
      await deleteFile(existingPost.image);
    }

    return response.status(204).end();
  } catch (error) {
    console.error('Error during post deletion:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

