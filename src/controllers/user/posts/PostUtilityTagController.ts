import {Request, Response} from "express";
import prisma from "../../../../prisma";
import {validate} from "../../../helpers/joi";
import Joi from "joi";
import {SLUG_PATTERN} from "./PostCategories";
import {checkExistingTagSlugs} from "./PostTags";

export const updateTags = async (request: Request, response: Response) => {
  const postId = request.params.id;
  const decodedToken = request['decodedToken'];
  const {tagSlugs} = request.body;

  try {
    const body = await validate({
      tagSlugs: Joi.array()
        .items(Joi.string().pattern(SLUG_PATTERN)).min(1)
        .max(15)
        .required(),
    }, request.body);

    if (body) return response.status(422).json(body.messages);

    // Check if the post exists
    const existingPost = await prisma.posts.count({
      where: {id: postId, userId: decodedToken.id},
    });

    if (!existingPost)
      return response.status(404).json({error: 'Post not found'});

    const tags = await checkExistingTagSlugs(tagSlugs);

    const createdPostTags = await Promise.all(
      tags.map(async (tag) => {
        return prisma.postTags.upsert({
          where: {
            postId_tagId: {
              postId: postId,
              tagId: tag.id,
            },
          },
          update: {
            postId: postId,
            tagId: tag.id,
          },
          create: {
            postId: postId,
            tagId: tag.id,
          },
        });
      })
    );

    return response.status(200).json(createdPostTags);
  } catch (error) {
    console.error('Error during tag update:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const removeTags = async (request: Request, response: Response) => {
  const postId = request.params.id;
  const decodedToken = request['decodedToken'];
  const tagSlugRemove = request.params.tagSlug;

  try {
    // Check if the post exists
    const existingPost = await prisma.posts.count({
      where: {id: postId, userId: decodedToken.id},
    });

    if (!existingPost)
      return response.status(404).json({error: 'Post not found'});

    // Retrieve the tag
    const existingTag = await prisma.tags.findFirst({
      where: {slug: tagSlugRemove},
    });

    if (!existingTag)
      return response.status(404).json({error: 'Tag not found'});

    // Check if the post-tag relationship exists
    const existingPostTag = await prisma.postTags.findFirst({
      where: {
        postId: postId,
        tagId: existingTag.id,
      },
    });

    if (!existingPostTag)
      return response.status(404).json({error: 'Tag not associated with the post'});

    // Remove the post-tag relationship
    await prisma.postTags.delete({
      where: {
        id: existingPostTag.id,
      },
    });

    return response.status(200).end();
  } catch (error) {
    console.error('Error during tag removal:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};
