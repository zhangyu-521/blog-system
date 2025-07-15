// src/modules/categories/categories.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, ...rest } = createCategoryDto;

    // 生成 slug
    const slug = this.generateSlug(name);

    // 检查名称和 slug 是否已存在
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existingCategory) {
      throw new ConflictException('分类名称已存在');
    }

    try {
      return await this.prisma.category.create({
        data: {
          name,
          slug,
          ...rest,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('分类名称已存在');
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 如果更新名称，需要重新生成 slug
    let slug = category.slug;
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      slug = this.generateSlug(updateCategoryDto.name);

      // 检查新的名称和 slug 是否已存在
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          OR: [{ name: updateCategoryDto.name }, { slug }],
          NOT: { id },
        },
      });

      if (existingCategory) {
        throw new ConflictException('分类名称已存在');
      }
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          ...updateCategoryDto,
          slug,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('分类名称已存在');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (category._count.articles > 0) {
      throw new BadRequestException('该分类下还有文章，无法删除');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
