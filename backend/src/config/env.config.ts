import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export const envConfig: ConfigModuleOptions = {
  envFilePath: '.env',
  isGlobal: true,
  validationSchema: Joi.object({
    DATABASE_HOST: Joi.string().default('localhost'),
    DATABASE_PORT: Joi.number().default(5432),
    DATABASE_USER: Joi.string().default('postgres'),
    DATABASE_PASSWORD: Joi.string().default('Kamal2093@'),
    DATABASE_NAME: Joi.string().default('AhazPharma'),
    JWT_SECRET: Joi.string().required(),
    EMAIL_USER: Joi.string().email().required(),
    EMAIL_PASSWORD: Joi.string().required(),
    PORT: Joi.number().default(5001),
  }),
  validationOptions: { abortEarly: false },
  load: [
    () => {
      console.log('envConfig: Loading .env:', process.env.JWT_SECRET ? 'JWT_SECRET present' : 'JWT_SECRET missing');
      return process.env;
    },
  ],
};