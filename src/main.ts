import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Office Rental API')
    .setDescription('API documentation for the Office Rental Management System')
    .setVersion('1.0')
    .addBearerAuth() // enables JWT auth in Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 👈 this enables type conversion (string → number)
      whitelist: true, // removes unwanted fields
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
