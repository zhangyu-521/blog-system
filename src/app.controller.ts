// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    const dbHealthy = await this.prismaService.isHealthy();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
      environment: this.configService.get('app.environment'),
    };
  }

  @Get('config')
  getConfig() {
    return {
      app: this.configService.get('app'),
      environment: this.configService.get('app.environment'),
      port: this.configService.get('app.port'),
    };
  }
}
