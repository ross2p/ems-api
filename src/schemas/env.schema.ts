import * as Joi from 'joi';
import { NodeEnv } from '../enums';

export const envSchema = Joi.object({
  // SERVER
  PORT: Joi.number().default(8080),
  BASE_URL: Joi.string().uri().required(),
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .default(NodeEnv.DEVELOPMENT),

  // SWAGGER
  SWAGGER_USER: Joi.string().required(),
  SWAGGER_PASSWORD: Joi.string().required(),

  // DATABASE
  DATABASE_URL: Joi.string().required(),

  // JWT
  ACCESS_TOKEN_EXPIRE: Joi.string().required(),
  REFRESH_TOKEN_EXPIRE: Joi.string().required(),
  JWT_SECRET_KEY: Joi.string().required(),

  // REDIS
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_TTL: Joi.number().default(300), // 5 minutes default
}).unknown(true);
