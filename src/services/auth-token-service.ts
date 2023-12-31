import {AUTH_DRIVER} from "../app";
import jwt, {JwtPayload} from "jsonwebtoken";
import {env} from "../helpers";
import {redisClient} from "./redis-service";
import {encrypt} from "../helpers/crypto";
import prisma from "../../prisma";
import {NextFunction, Request, Response} from "express";
import ms from "ms";

// https://www.npmjs.com/package/ms
const TOKEN_EXP_TIME = ms(env('TOKEN_EXP_TIME', '1h'));
const REFRESH_TOKEN_EXP_TIME = ms(env('REFRESH_TOKEN_EXP_TIME', '1w'));

export interface AuthTokenServiceType {
  id: string
  role: string
  iat: number,
  exp: number,
}

export const verifySessionId = async (request: Request, response: Response, next: NextFunction, role: string) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).send({Message: 'UnAuthorized access'});
  }

  const token: string = authHeader.split(' ')[1] || null;

  if (AUTH_DRIVER === 'jwt') {
    try {
      const secret = env('JWT_KEY');
      const decoded = jwt.verify(token, secret) as JwtPayload;

      if (decoded.role !== role) {
        return response.status(403).send({error: 'Forbidden access'});
      }

      decoded.token = token;
      request['decodedToken'] = decoded;
      return next();
    } catch (err) {
      return response.status(403).send({error: 'Forbidden access'});
    }
  } else {
    try {
      const value: string = await redisClient.get(token);
      const decoded = JSON.parse(value);

      if (value && decoded?.role === role && decoded?.id) {
        decoded.token = token;
        request['decodedToken'] = decoded;
        return next();
      }

      return response.status(403).send({error: 'Forbidden access'});
    } catch (err) {
      return response.status(403).send({error: 'Forbidden access'});
    }
  }
}

export const generateSessionId = async (id: string, role: string) => {
  let token: string;

  if (AUTH_DRIVER === 'jwt') {
    token = jwt.sign({id: id, role: role}, env('JWT_KEY'), {expiresIn: TOKEN_EXP_TIME});
  } else {
    const now = Math.floor(Date.now() / 1000)
    const data: string = JSON.stringify({
      id: id,
      role: role,
      iat: now,
      exp: now + TOKEN_EXP_TIME
    });
    token = encrypt(data)
    await redisClient.set(token, data, 'EX', TOKEN_EXP_TIME / 1000);
  }

  try {
    await prisma.userSessions.create({
      data: {
        userId: id,
        token: token,
        expiresAt: new Date(Date.now() + TOKEN_EXP_TIME * 1000), // Set expiration time
      },
    });
  } catch (error) {
    console.error('Error creating user session:', error);
    throw new Error('Failed to create user session');
  }

  return token;
};

export const getRefreshToken = async (id: string, role: string) => {

  const now = Math.floor(Date.now() / 1000)
  const data = JSON.stringify({
    id: id,
    role: role,
    iat: now,
    exp: now + REFRESH_TOKEN_EXP_TIME
  });

  const token = encrypt(data)
  await redisClient.set(token, data, 'EX', REFRESH_TOKEN_EXP_TIME / 1000);

  return token
}