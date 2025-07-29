// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip;

    const now = Date.now();
    const requestId = this.generateRequestId();

    // 记录请求信息
    this.logger.log(
      `[${requestId}] ${method} ${url} - ${ip} - ${userAgent}`,
      'REQUEST',
    );

    // 记录请求详情（开发环境）
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(
        `[${requestId}] Body: ${JSON.stringify(body)} Query: ${JSON.stringify(query)} Params: ${JSON.stringify(params)}`,
        'REQUEST_DETAILS',
      );
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `[${requestId}] ${method} ${url} ${response.statusCode} - ${responseTime}ms`,
            'RESPONSE',
          );

          // 记录响应详情（开发环境）
          if (process.env.NODE_ENV === 'development') {
            this.logger.debug(
              `[${requestId}] Response: ${JSON.stringify(data)}`,
              'RESPONSE_DETAILS',
            );
          }
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `[${requestId}] ${method} ${url} ${error.status || 500} - ${responseTime}ms - ${error.message}`,
            error.stack,
            'ERROR',
          );
        },
      }),
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
