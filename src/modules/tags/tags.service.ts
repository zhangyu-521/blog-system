// src/modules/tags/tags.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tag, Prisma } from '@prisma/client';

export interface CreateTagDto {
  name: string;
  description?: string;
  color?: string;
}

import { QueryTagDto } from './dto/query-tag.dto';

export interface UpdateTagDto {
  name?: string;
  description?: string | null;
  color?: string | null;
}

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const { name, ...rest } = createTagDto;
    const slug = this.generateSlug(name);

    try {
      return await this.prisma.tag.create({
        data: {
          name,
          slug,
          ...rest,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('标签名称已存在');
        }
      }
      throw error;
    }
  }

  async findAll(query: QueryTagDto): Promise<{ data: Tag[]; total: number }> {
    const { page, limit, name, description } = query;
    const where: Prisma.TagWhereInput = {};

    if (name) {
      where.name = { contains: name };
    }
    if (description) {
      where.description = { contains: description };
    }

    const [data, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ useCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: { articleTags: true },
          },
        },
      }),
      this.prisma.tag.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Tag | null> {
    return this.prisma.tag.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findById(id);
    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    let slug = tag.slug;
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      slug = this.generateSlug(updateTagDto.name);
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        ...updateTagDto,
        slug,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findById(id);
    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    await this.prisma.tag.delete({
      where: { id },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async incrementUseCount(id: string): Promise<void> {
    await this.prisma.tag.update({
      where: { id },
      data: {
        useCount: { increment: 1 },
      },
    });
  }

  async batchCreate(names: string[]): Promise<number> {
    const created = await this.prisma.$transaction(
      names.map((name) =>
        this.prisma.tag.upsert({
          where: { name },
          create: {
            name,
            slug: this.generateSlug(name),
            useCount: 0,
          },
          update: { useCount: { increment: 1 } },
        }),
      ),
    );
    return created.length;
  }
}
