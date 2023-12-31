import {Request, Response} from "express";
import {redisClient} from "../services/redis-service";
import {generateSessionId} from "../services/auth-token-service";
import {AUTH_DRIVER} from "../app";
import prisma from "../../prisma";

export const auth = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: decodedToken.id,
      },
    });
    if (user) {
      user.password = undefined
      return response.status(200).json({user, decodedToken});
    } else {
      return response.status(404).json({message: "No such user exists"});
    }
  } catch (error) {
    return response.status(500).json({message: error.message, code: error.code})
  }
};

export const refreshToken = async (request: Request, response: Response) => {
  // Check if refresh token is provided
  if (!request.body.refreshToken) {
    return response.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const refreshToken: string = await redisClient.get(request.body.refreshToken)

    if (!refreshToken)
      return response.status(401).json({error: 'Refresh token is expired or invalid'})

    const data = JSON.parse(refreshToken)

    const accessToken = await generateSessionId(data.id, data.role);

    // Send the new access token in the response
    return response.status(200).json({ accessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return response.status(500).json({error: 'Invalid refresh token'});
  }
};

export const logout = async (request: Request, response: Response) => {
  const decodedToken = request['decodedToken'];

  try {
    if (AUTH_DRIVER === 'jwt') {
      const remainingExpTime = decodedToken.exp - Math.floor(Date.now() / 1000);
      await redisClient.set(decodedToken.token, 'blocked', 'EX', remainingExpTime);
    } else {
      redisClient.del(decodedToken.token);
    }

    return response.status(200).json({message: 'Logout successful'});
  } catch (error) {
    console.error('Error during logout:', error);
    return response.status(500).json({error: 'Internal server error'});
  }
};
