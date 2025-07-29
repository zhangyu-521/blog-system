// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 启用 CORS
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: configService.get('cors.credentials'),
  });

  // 全局验证管道
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

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('NestJS 博客 API')
    .setDescription('基于 NestJS + Prisma + MySQL 的博客系统 API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入 JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('认证', '用户认证相关接口')
    .addTag('用户管理', '用户管理相关接口')
    .addTag('文章管理', '文章管理相关接口')
    .addTag('分类管理', '分类管理相关接口')
    .addTag('标签管理', '标签管理相关接口')
    .addTag('评论管理', '评论管理相关接口')
    .addTag('文件上传', '文件上传相关接口')
    .addServer('http://localhost:3000', '开发环境')
    .addServer('https://api.yourdomain.com', '生产环境')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 自定义 Swagger UI 配置
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'NestJS 博客 API 文档',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  const port = configService.get('app.port');
  await app.listen(port);

  console.log(`应用运行在: http://localhost:${port}`);
  console.log(`API 文档地址: http://localhost:${port}/api-docs`);
}
bootstrap();
