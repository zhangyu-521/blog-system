// src/modules/articles/entities/article.entity.ts
import { Article, ArticleStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';

export class ArticleEntity implements Article {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  excerpt: string | null;

  @ApiProperty({ required: false })
  coverImage: string | null;

  @ApiProperty({ enum: ArticleStatus })
  status: ArticleStatus;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  likeCount: number;

  @ApiProperty({ required: false })
  metaTitle: string | null;

  @ApiProperty({ required: false })
  metaDescription: string | null;

  @ApiProperty({ required: false })
  metaKeywords: string | null;

  @ApiProperty({ required: false })
  publishedAt: Date | null;

  @ApiProperty()
  allowComments: boolean;

  @ApiProperty()
  isPinned: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // 关联数据（可选）
  @ApiProperty({ type: () => UserEntity, required: false })
  author?: UserEntity;

  @ApiProperty({ required: false })
  category?: any;

  @ApiProperty({ required: false })
  tags?: any[];

  @ApiProperty({ required: false })
  comments?: any[];

  @ApiProperty({ required: false })
  commentsCount?: number;

  constructor(
    article: Article & {
      author?: any;
      category?: any;
      tags?: any[];
      comments?: any[];
      commentsCount?: number;
    },
  ) {
    Object.assign(this, article);
  }
}
