import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommentStatus } from '@prisma/client';

export class QueryCommentDto {
  @ApiPropertyOptional({
    description: '页码',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码最小为1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量最小为1' })
  @Max(100, { message: '每页数量最大为100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '文章ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: '文章ID必须是有效的UUID' })
  articleId?: string;

  @ApiPropertyOptional({
    description: '作者ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: '作者ID必须是有效的UUID' })
  authorId?: string;

  @ApiPropertyOptional({
    description: '父评论ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: '父评论ID必须是有效的UUID' })
  parentId?: string;

  @ApiPropertyOptional({
    description: '评论状态',
    enum: CommentStatus,
  })
  @IsOptional()
  @IsEnum(CommentStatus, { message: '无效的评论状态' })
  status?: CommentStatus;

  @ApiPropertyOptional({
    description: '排序字段',
    default: 'createdAt',
    enum: ['createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序方向',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString({ message: '排序方向必须是字符串' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}
