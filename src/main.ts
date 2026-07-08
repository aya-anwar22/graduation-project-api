import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/config/winston.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  app.use(cookieParser());

  // إعداد الـ CORS بشكل كامل لمرة واحدة فقط
  app.enableCors({
    origin: true, // بيسمح لأي Domain يبعت طلب
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // مهم جداً طالما بتستخدمي Cookies
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || 3000;

  // الـ '0.0.0.0' ممتازة عشان الـ IP ميتغيرش أو السيرفر يقبل من أي مصدر خارجي
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application running on: http://localhost:${port}`);
}
bootstrap();
