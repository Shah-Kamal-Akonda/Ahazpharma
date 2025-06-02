import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'Uploads')));

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();