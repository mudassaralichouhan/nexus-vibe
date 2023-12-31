import {Request, Response} from "express";
import prisma from "../../../../prisma";
import {validate} from "../../../helpers/joi";
import Joi from "joi";
import {checkExistingSlugs, SLUG_PATTERN} from "./PostCategories";

export const updateCategories = async (request: Request, response: Response) => {
  const postId = request.params.id;
  const decodedToken = request['decodedToken'];
  const {categorySlugs} = request.body;

  try {
    const body = await validate({
      categorySlugs: Joi
        .array()
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

    const categories = await checkExistingSlugs(categorySlugs);

    const createdPostCategories = await Promise.all(
      categories.map(async (cat) => {
        return prisma.postCategories.upsert({
          where: {
            postId_categoryId: {
              postId: postId,
              categoryId: cat.id,
            },
          },
          update: {
            postId: postId,
            categoryId: cat.id,
          },
          create: {
            postId: postId,
            categoryId: cat.id,
          },
        });
      })
    );

    return response.status(200).json(createdPostCategories);
  } catch (error) {
    console.error('Error during category update:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const removeCategory = async (request: Request, response: Response) => {
  const postId = request.params.id;
  const decodedToken = request['decodedToken'];
  const categoryIdToRemove = request.params.categoryId; // Assuming you pass the categoryId in the URL parameter

  try {
    // Check if the post exists
    const existingPost = await prisma.posts.count({
      where: {id: postId, userId: decodedToken.id},
    });

    if (!existingPost)
      return response.status(404).json({error: 'Post not found'});

    // Check if the category exists
    const existingCategory = await prisma.categories.count({
      where: {id: categoryIdToRemove},
    });

    if (!existingCategory)
      return response.status(404).json({error: 'Category not found'});

    // Check if the post-category relationship exists
    const existingPostCategory = await prisma.postCategories.findFirst({
      where: {
        postId: postId,
        categoryId: categoryIdToRemove,
      },
    });

    if (!existingPostCategory)
      return response.status(404).json({error: 'Category not associated with the post'});

    // Remove the post-category relationship
    await prisma.postCategories.delete({
      where: {
        id: existingPostCategory.id
      },
    });

    return response.status(200).end();
  } catch (error) {
    console.error('Error during category removal:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};
