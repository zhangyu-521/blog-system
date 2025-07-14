import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 启用 CORS
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: configService.get('cors.credentials'),
  });

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动删除非装饰器属性
      forbidNonWhitelisted: true, // 如果有非装饰器属性则抛出错误
      transform: true, // 自动转换类型
      disableErrorMessages: false, // 启用错误消息
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
