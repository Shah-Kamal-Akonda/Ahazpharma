import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export const envConfig: ConfigModuleOptions = {
  envFilePath: '.env',
  isGlobal: true,
  validationSchema: Joi.object({
    DATABASE_HOST: Joi.string().required(),
    DATABASE_PORT: Joi.number().default(5432),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    EMAIL_USER: Joi.string().email().required(),
    EMAIL_PASSWORD: Joi.string().required(),
    OWNER_EMAIL: Joi.string().email().required(),
    PORT: Joi.number().default(5001),
    ULTRAMSG_INSTANCE_ID: Joi.string().required(),
    ULTRAMSG_TOKEN: Joi.string().required(),
    ULTRAMSG_ADMIN_NUMBER: Joi.string().required(),
  }),
  validationOptions: { abortEarly: false },
  load: [
    () => {
      console.log('envConfig: Loading .env:', process.env.JWT_SECRET ? 'JWT_SECRET present' : 'JWT_SECRET missing');
      return process.env;
    },
  ],
};