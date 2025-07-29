// src/test/setup.ts
import { PrismaClient } from '@prisma/client';

// 全局测试设置
beforeAll(async () => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/blog_test';
});

afterAll(async () => {
  // 清理测试数据
  const prisma = new PrismaClient();
  await prisma.$disconnect();
});
