import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { ApiExceptionFilter } from './common/filters/api-exception.filter';

import helmet from 'helmet';

import { AppModule } from './app.module';
import { Config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<Config, true>);

  const port = configService.get('port', { infer: true });
  const cors = configService.get('cors', { infer: true });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  app.useGlobalFilters(new ApiExceptionFilter());
  
  console.log("Swagger started...")
  const config = new DocumentBuilder()
    .setTitle('ScholarArk API')
    .setDescription('API documentation for ScholarArk — Courses & Users services')
    .setVersion('1.0')
    .addTag('users')
    .addTag('courses')
	.addBearerAuth()
    .build();
	
	//console.log("Swagger config created...")
  const document = SwaggerModule.createDocument(app, config);
  	//console.log("Swagger document created...")
  SwaggerModule.setup('api/docs', app, document);
  	//console.log("Swagger mounted...")
  
  app.enableCors({ origin: cors.origin });

  await app.listen(port, () => {
    console.log(`Api is listening on port ${port}.`);
  });
}
bootstrap();
