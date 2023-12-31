import RedisClient from "ioredis";
import {env} from "../helpers";

const port = env('REDIS_PORT');
const host = env('REDIS_HOST');

export const redisClient = new RedisClient(parseInt(port), host, {
  username: env('REDIS_USERNAME'), // needs Redis >= 6
  password: env('REDIS_PASSWORD'),
  db: 0, // Defaults to 0
});

redisClient.on('error', (err: Error): void => {
  console.error('Redis connection error:', err);
});

redisClient.on('connect', (): void => {
  console.error('Redis connection');
});