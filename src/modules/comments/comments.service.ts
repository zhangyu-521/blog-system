// src/modules/comments/comments.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { Comment, CommentStatus, UserRole } from '@prisma/client';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCommentDto: CreateCommentDto,
    authorId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Comment> {
    const { articleId, parentId, content } = createCommentDto;

    // 验证文章是否存在且允许评论
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    if (!article.allowComments) {
      throw new BadRequestException('该文章不允许评论');
    }

    // 如果是回复评论，验证父评论是否存在
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('父评论不存在');
      }

      if (parentComment.articleId !== articleId) {
        throw new BadRequestException('父评论不属于该文章');
      }
    }

    return this.prisma.comment.create({
      data: {
        content,
        articleId,
        authorId,
        parentId,
        ipAddress,
        userAgent,
        status: CommentStatus.PENDING, // 默认待审核
      },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  async findByArticle(articleId: string, query: QueryCommentDto) {
    const { status, parentId, sortBy, sortOrder } = query;

    return this.prisma.comment.findMany({
      where: {
        articleId,
        status: status || CommentStatus.APPROVED,
        parentId: parentId || null,
      },
      include: {
        author: true,
        replies: {
          where: { status: status || CommentStatus.APPROVED },
          include: {
            author: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    });
  }

  async updateStatus(
    id: string,
    status: CommentStatus,
    currentUser: UserEntity,
  ): Promise<Comment> {
    // 只有管理员和版主可以更新评论状态
    if (!['ADMIN', 'MODERATOR'].includes(currentUser.role)) {
      throw new ForbiddenException('无权更新评论状态');
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string, currentUser: UserEntity): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 只有评论作者或管理员可以删除评论
    if (
      comment.authorId !== currentUser.id &&
      currentUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('无权删除此评论');
    }

    await this.prisma.comment.delete({
      where: { id },
    });
  }
}
