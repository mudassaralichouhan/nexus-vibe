import {rateLimit} from 'express-rate-limit'
import {RedisReply, RedisStore} from "rate-limit-redis";
import {redisClient} from "../services/redis-service";
import {RateLimitRequestHandler} from "express-rate-limit/dist";
import {env} from "../helpers";

const rateLimiterMiddleware: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // per minutes
  limit: env('ENVIRONMENT') === 'production' ? 12 : 60, // Limit each IP to 12 requests per `window` (here, per 15 minutes)
  standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {error: 'Too many requests, please try again later.'},
  store: new RedisStore({
    sendCommand: async (command: string, ...args: Array<string | Buffer | number>): Promise<RedisReply> => {
      const result = await redisClient.call(command, ...args);
      // You may need to handle the conversion from unknown to RedisReply here
      return result as RedisReply;
    },
  }),
})

export default rateLimiterMiddleware;