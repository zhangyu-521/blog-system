import { ApiProperty } from '@nestjs/swagger';
import { CommentStatus } from '@prisma/client';
import { UserEntity } from '../../users/entities/user.entity';
import { ArticleEntity } from '../../articles/entities/article.entity';

export class CommentEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  status: CommentStatus;

  @ApiProperty()
  articleId: string;

  @ApiProperty({ type: () => ArticleEntity })
  article?: ArticleEntity;

  @ApiProperty()
  authorId: string;

  @ApiProperty({ type: () => UserEntity })
  author?: UserEntity;

  @ApiProperty({ nullable: true })
  parentId: string | null;

  @ApiProperty({ type: () => CommentEntity, isArray: true })
  replies?: CommentEntity[];

  @ApiProperty()
  ipAddress?: string;

  @ApiProperty()
  userAgent?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<CommentEntity>) {
    Object.assign(this, partial);
  }
}
