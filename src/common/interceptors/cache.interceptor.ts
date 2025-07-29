// src/common/interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

// 缓存装饰器
export const CacheKey = (key: string) =>
  Reflector.createDecorator<string>({ key });
export const CacheTTL = (ttl: number) =>
  Reflector.createDecorator<number>({ transform: () => ttl });

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: any; expiry: number }>();

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cacheKey = this.reflector.get(CacheKey, context.getHandler());
    const cacheTTL =
      this.reflector.get(CacheTTL, context.getHandler()) || 60000; // 默认1分钟

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const fullCacheKey = this.generateCacheKey(cacheKey, request);

    // 检查缓存
    const cached = this.cache.get(fullCacheKey);
    if (cached && cached.expiry > Date.now()) {
      return of(cached.data);
    }

    return next.handle().pipe(
      tap((data) => {
        // 存储到缓存
        this.cache.set(fullCacheKey, {
          data,
          expiry: Date.now() + cacheTTL,
        });

        // 清理过期缓存
        this.cleanExpiredCache();
      }),
    );
  }

  private generateCacheKey(baseKey: string, request: any): string {
    const { method, url, query, params } = request;
    const queryString = JSON.stringify(query);
    const paramsString = JSON.stringify(params);
    return `${baseKey}:${method}:${url}:${queryString}:${paramsString}`;
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }

  // 清除指定缓存
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
