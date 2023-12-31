import {Request, Response} from 'express';
import prisma from "../../../../prisma";

export const show = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];

  try {
    const message = await prisma.message.findFirst({
      where: {
        id: request.params.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        Chat: true,
      },
    });

    if (!message) {
      return response.status(404).end();
    }

    return response.status(200).json(message);
  } catch (error) {
    console.error('Error during fetching message details:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const destroy = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];

  try {
    // Check if the message exists for the specified user
    const message = await prisma.message.findFirst({
      where: {
        id: request.params.id,
        authorId: decodedToken.id,
      },
    });

    if (!message) {
      return response.status(404).end();
    }

    // Delete the message
    await prisma.message.delete({
      where: {
        id: request.params.id,
      },
    });

    return response.status(204).end();
  } catch (error) {
    console.error('Error during message deletion:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};