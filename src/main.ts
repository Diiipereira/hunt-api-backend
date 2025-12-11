import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './core/auth/guards/jwt-auth.guard';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const publicPath = join(process.cwd(), 'public', 'assets');
  app.useStaticAssets(publicPath, {
    prefix: '/assets/',
  });

  const config = new DocumentBuilder()
    .setTitle('Bonus Hunt API')
    .setDescription('API para gerenciamento de caçadas de bônus')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: 'GET, POST, PATCH, DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
