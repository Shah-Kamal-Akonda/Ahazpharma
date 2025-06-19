import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'https://ahazpharma-69bi-mcgp52dbo-md-shah-kamal-akondas-projects.vercel.app/'], // Replace with your Vercel URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Serve static files
  app.use('/uploads', express.static(join(__dirname, '..', 'Uploads'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.jpeg') || path.endsWith('.jpg')) {
        res.set('Content-Type', 'image/jpeg');
      } else if (path.endsWith('.png')) {
        res.set('Content-Type', 'image/png');
      }
    },
  }));

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();