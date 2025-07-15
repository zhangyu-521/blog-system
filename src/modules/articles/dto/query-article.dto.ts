// src/modules/articles/dto/query-article.dto.ts
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';

export class QueryArticleDto {
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

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string;

  @ApiPropertyOptional({
    description: '文章状态',
    enum: ArticleStatus,
  })
  @IsOptional()
  @IsEnum(ArticleStatus, { message: '无效的文章状态' })
  status?: ArticleStatus;

  @ApiPropertyOptional({
    description: '分类ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: '分类ID必须是有效的UUID' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: '标签ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: '标签ID必须是有效的UUID' })
  tagId?: string;

  @ApiPropertyOptional({
    description: '作者ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: '作者ID必须是有效的UUID' })
  authorId?: string;

  @ApiPropertyOptional({
    description: '是否只显示置顶文章',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: '置顶状态必须是布尔值' })
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: '是否只显示推荐文章',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: '推荐状态必须是布尔值' })
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    default: 'createdAt',
    enum: [
      'createdAt',
      'updatedAt',
      'publishedAt',
      'viewCount',
      'likeCount',
      'title',
    ],
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
