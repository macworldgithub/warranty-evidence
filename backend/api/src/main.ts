import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Booran Warranty Evidence Capture API')
    .setDescription(
      'RESTful API for the Booran Warranty Evidence Capture System. Manages Brands, Dealership Rooftops, Brand Packs, Users, Authentication, and Warranty Evidence Specifications.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your Supabase JWT bearer token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'System health checks')
    .addTag('Auth', 'User profile and authentication session')
    .addTag('Users', 'User accounts, roles, and site assignments')
    .addTag('Brands', 'OEM vehicle brands and franchises')
    .addTag('Sites', 'Physical dealership rooftops and service workshops')
    .addTag('Brand Packs', 'Warranty rules, Tier 1/Tier 2 evidence, conditionals, and naming templates')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Booran Warranty API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
    },
  });
  SwaggerModule.setup('api/v1/docs', app, document, {
    customSiteTitle: 'Booran Warranty API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
    },
  });

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);

  console.log(`🚀 Booran API is running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger Documentation is available at: http://localhost:${port}/docs`);
}

await bootstrap();
