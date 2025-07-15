// src/modules/articles/articles.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { ArticleEntity } from './entities/article.entity';
import { ArticleStatus, CommentStatus, Prisma, UserRole } from '@prisma/client';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createArticleDto: CreateArticleDto,
    authorId: string,
  ): Promise<ArticleEntity> {
    const { tagIds, ...articleData } = createArticleDto;

    // 生成 slug
    const slug = await this.generateUniqueSlug(createArticleDto.title);

    // 验证分类是否存在
    const category = await this.prisma.category.findUnique({
      where: { id: createArticleDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('指定的分类不存在');
    }

    // 验证标签是否存在
    if (tagIds && tagIds.length > 0) {
      const existingTags = await this.prisma.tag.findMany({
        where: { id: { in: tagIds } },
      });

      if (existingTags.length !== tagIds.length) {
        throw new BadRequestException('部分标签不存在');
      }
    }

    try {
      const article = await this.prisma.article.create({
        data: {
          ...articleData,
          slug,
          authorId,
          publishedAt:
            articleData.status === ArticleStatus.PUBLISHED ? new Date() : null,
          // 创建文章标签关联
          articleTags: tagIds
            ? {
                create: tagIds.map((tagId) => ({
                  tag: { connect: { id: tagId } },
                })),
              }
            : undefined,
        },
        include: {
          author: true,
          category: true,
          articleTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // 更新标签使用次数
      if (tagIds && tagIds.length > 0) {
        await this.prisma.tag.updateMany({
          where: { id: { in: tagIds } },
          data: { useCount: { increment: 1 } },
        });
      }

      return new ArticleEntity({
        ...article,
        tags: article.articleTags.map((at) => at.tag),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('文章标题已存在');
        }
      }
      throw error;
    }
  }

  async findAll(queryDto: QueryArticleDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      categoryId,
      tagId,
      authorId,
      isPinned,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: Prisma.ArticleWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tagId) {
      where.articleTags = {
        some: {
          tagId: tagId,
        },
      };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (isPinned !== undefined) {
      where.isPinned = isPinned;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // 构建排序条件
    const orderBy: Prisma.ArticleOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: true,
          category: true,
          articleTags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles.map(
        (article) =>
          new ArticleEntity({
            ...article,
            tags: article.articleTags.map((at) => at.tag),
            commentsCount: article._count.comments,
          }),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findBySlug(slug: string): Promise<ArticleEntity | null> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        category: true,
        articleTags: {
          include: {
            tag: true,
          },
        },
        comments: {
          where: { status: CommentStatus.APPROVED },
          include: {
            author: true,
            replies: {
              include: {
                author: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!article) {
      return null;
    }

    // 增加浏览次数
    await this.prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return new ArticleEntity({
      ...article,
      tags: article.articleTags.map((at) => at.tag),
    });
  }

  async findById(id: string): Promise<ArticleEntity | null> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        articleTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return article
      ? new ArticleEntity({
          ...article,
          tags: article.articleTags.map((at) => at.tag),
        })
      : null;
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    currentUser: UserEntity,
  ): Promise<ArticleEntity> {
    const article = await this.findById(id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    // 权限检查：只有作者或管理员可以编辑
    if (
      article.authorId !== currentUser.id &&
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.MODERATOR
    ) {
      throw new ForbiddenException('无权编辑此文章');
    }

    const { tagIds, ...articleData } = updateArticleDto;

    // 准备更新数据
    const updateData: any = { ...articleData };

    // 如果状态改为已发布且之前未发布，设置发布时间
    if (
      articleData.status === ArticleStatus.PUBLISHED &&
      article.status !== ArticleStatus.PUBLISHED
    ) {
      updateData.publishedAt = new Date();
    }

    try {
      // 更新文章标签关联
      if (tagIds !== undefined) {
        // 删除现有标签关联
        await this.prisma.articleTag.deleteMany({
          where: { articleId: id },
        });

        // 创建新的标签关联
        if (tagIds.length > 0) {
          await this.prisma.articleTag.createMany({
            data: tagIds.map((tagId) => ({
              articleId: id,
              tagId,
            })),
          });

          // 更新标签使用次数
          await this.prisma.tag.updateMany({
            where: { id: { in: tagIds } },
            data: { useCount: { increment: 1 } },
          });
        }
      }

      const updatedArticle = await this.prisma.article.update({
        where: { id },
        data: updateData,
        include: {
          author: true,
          category: true,
          articleTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return new ArticleEntity({
        ...updatedArticle,
        tags: updatedArticle.articleTags.map((at) => at.tag),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('文章标题已存在');
        }
      }
      throw error;
    }
  }

  async remove(id: string, currentUser: UserEntity): Promise<void> {
    const article = await this.findById(id);
    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    // 权限检查：只有作者或管理员可以删除
    if (
      article.authorId !== currentUser.id &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('无权删除此文章');
    }

    await this.prisma.article.delete({
      where: { id },
    });
  }

  async toggleLike(id: string): Promise<{ liked: boolean; likeCount: number }> {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    // 简单的点赞实现（实际项目中应该记录用户点赞状态）
    const updatedArticle = await this.prisma.article.update({
      where: { id },
      data: {
        likeCount: { increment: 1 },
      },
    });

    return {
      liked: true,
      likeCount: updatedArticle.likeCount,
    };
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async getArticleStats(authorId?: string) {
    const where: Prisma.ArticleWhereInput = authorId ? { authorId } : {};

    const [total, published, draft, archived] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.count({
        where: { ...where, status: ArticleStatus.PUBLISHED },
      }),
      this.prisma.article.count({
        where: { ...where, status: ArticleStatus.DRAFT },
      }),
      this.prisma.article.count({
        where: { ...where, status: ArticleStatus.ARCHIVED },
      }),
    ]);

    return {
      total,
      published,
      draft,
      archived,
    };
  }
}
