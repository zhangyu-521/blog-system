// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建种子数据...');

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  // 创建普通用户
  const userPassword = await bcrypt.hash('user123456', 10);

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'user',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      bio: '一个热爱技术的开发者',
      emailVerified: true,
    },
  });

  // 创建分类
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: '技术',
        slug: 'technology',
        description: '技术相关文章',
        color: '#3B82F6',
        icon: 'tech',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'lifestyle' },
      update: {},
      create: {
        name: '生活',
        slug: 'lifestyle',
        description: '生活感悟和经验分享',
        color: '#10B981',
        icon: 'life',
        sortOrder: 2,
      },
    }),
  ]);

  // 创建标签
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'nestjs' },
      update: {},
      create: {
        name: 'NestJS',
        slug: 'nestjs',
        description: 'NestJS框架相关',
        color: '#E11D48',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: {
        name: 'TypeScript',
        slug: 'typescript',
        description: 'TypeScript语言相关',
        color: '#3178C6',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'database' },
      update: {},
      create: {
        name: '数据库',
        slug: 'database',
        description: '数据库相关技术',
        color: '#F59E0B',
      },
    }),
  ]);

  console.log('种子数据创建完成！');
  console.log({ admin, user, categories, tags });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
