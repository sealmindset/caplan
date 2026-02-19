import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api', {
    exclude: ['health', 'health/live', 'health/ready'],
  });

  const port = process.env.PORT || 8080;
  await app.listen(port);

  console.log(`Application running on port ${port}`);
}

bootstrap();
