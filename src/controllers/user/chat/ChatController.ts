import {Request, Response} from 'express';
import prisma from "../../../../prisma";
import Joi from "joi";
import {validate} from "../../../helpers/joi";

export const index = async (request: Request, response: Response) => {
  const {skip, take} = request.query;
  const decodedToken = request['decodedToken'];

  try {
    const parsedSkip: number = typeof skip === 'string' ? parseInt(skip, 10) : 0;
    const parsedTake: number = typeof take === 'string' ? parseInt(take, 10) : 15;

    const totalCount = await prisma.chat.count({
      where: {
        OR: [
          {
            userId: decodedToken.id,
          },
          {
            partnerId: decodedToken.id,
          },
        ],
      },
    });

    const chats = await prisma.chat.findMany({
      skip: parsedSkip,
      take: parsedTake,
      where: {
        OR: [
          {
            userId: decodedToken.id,
          },
          {
            partnerId: decodedToken.id,
          },
        ],
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      }
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
      data: chats,
      meta: {
        pagination: paginationInfo,
      },
    };

    return response.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error during fetching chats index:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const createOrUpdate = async (request: Request, response: Response) => {
  request.body['partnerId'] = request.params.partnerId
  const decodedToken = request['decodedToken'];

  try {
    const body = await validate({
      text: Joi.string()
        .required()
        .min(1)
        .max(255),
      partnerId: Joi
        .string()
        .required()
        .min(24),
      attachment: Joi
        .allow(null)
    }, request.body);

    if (body) return response.status(422).json(body.messages);

    const partner = await prisma.users.findUnique({
      where: {
        id: request.body.partnerId
      },
      select: {
        id: true
      }
    })

    if (!partner)
      return response.status(404).json({error: 'partner id not found'});

    // Check if chat already exists
    let existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          {
            userId: decodedToken.id,
          },
          {
            partnerId: partner.id,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!existingChat) {
      existingChat = await prisma.chat.create({
        data: {
          userId: decodedToken.id,
          partnerId: request.body.partnerId,
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        chatId: existingChat.id,
        authorId: decodedToken.id,
        text: request.body.text,
      }
    });

    return response.status(201).json(message);
  } catch (error) {
    console.error('Error during chat creation or update:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const show = async (request: Request, response: Response) => {
  const {id} = request.params;
  const {skip, take} = request.query;
  const decodedToken = request['decodedToken'];

  try {
    const parsedSkip: number = typeof skip === 'string' ? parseInt(skip, 10) : 0;
    const parsedTake: number = typeof take === 'string' ? parseInt(take, 10) : 15;

    const totalCount = await prisma.message.count({
      where: {
        chatId: id,
      },
    });

    const partnerChats = await prisma.message.findMany({
      skip: parsedSkip,
      take: parsedTake,
      where: {
        chatId: id,
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
      data: partnerChats,
      meta: {
        pagination: paginationInfo,
      },
    };

    return response.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error during fetching partner chats:', error);
    return response.status(500).json({error: 'Internal server error'});
  } finally {
    await prisma.$disconnect();
  }
};

export const destroy = async (request: Request, response: Response) => {

};