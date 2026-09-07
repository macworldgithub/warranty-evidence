import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // CORS configuration
  const webUrl = configService.get<string>('FRONTEND_WEB_URL', 'http://localhost:3000');
  const adminUrl = configService.get<string>('FRONTEND_ADMIN_URL', 'http://localhost:3000');
  const operationsUrl = configService.get<string>('FRONTEND_OPERATIONS_URL', 'http://localhost:3001');

  app.enableCors({
    origin: [webUrl, adminUrl, operationsUrl],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);

  console.log(`🚀 Booran API is running on: http://localhost:${port}/api/v1`);
}

await bootstrap();
