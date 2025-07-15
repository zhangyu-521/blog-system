// src/modules/articles/dto/create-article.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';

export class CreateArticleDto {
  @ApiProperty({
    description: '文章标题',
    example: 'NestJS 实战指南',
    maxLength: 255,
  })
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  @MaxLength(255, { message: '标题最多255个字符' })
  title: string;

  @ApiProperty({
    description: '文章内容',
    example: '这是一篇关于 NestJS 的详细教程...',
  })
  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '文章摘要',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '摘要必须是字符串' })
  @MaxLength(500, { message: '摘要最多500个字符' })
  excerpt?: string;

  @ApiPropertyOptional({
    description: '封面图片URL',
  })
  @IsOptional()
  @IsString({ message: '封面图片URL必须是字符串' })
  coverImage?: string;

  @ApiProperty({
    description: '分类ID',
  })
  @IsString({ message: '分类ID必须是字符串' })
  @IsNotEmpty({ message: '分类ID不能为空' })
  categoryId: string;

  @ApiPropertyOptional({
    description: '标签ID列表',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '标签ID必须是数组' })
  @IsString({ each: true, message: '每个标签ID必须是字符串' })
  tagIds?: string[];

  @ApiPropertyOptional({
    description: '文章状态',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  @IsOptional()
  status?: ArticleStatus;

  @ApiPropertyOptional({
    description: '是否允许评论',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: '允许评论必须是布尔值' })
  allowComments?: boolean;

  @ApiPropertyOptional({
    description: '是否置顶',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: '置顶必须是布尔值' })
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: '是否推荐',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: '推荐必须是布尔值' })
  isFeatured?: boolean;

  // SEO 相关字段
  @ApiPropertyOptional({
    description: 'SEO标题',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'SEO标题必须是字符串' })
  @MaxLength(255, { message: 'SEO标题最多255个字符' })
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO描述',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'SEO描述必须是字符串' })
  @MaxLength(500, { message: 'SEO描述最多500个字符' })
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'SEO关键词',
  })
  @IsOptional()
  @IsString({ message: 'SEO关键词必须是字符串' })
  metaKeywords?: string;
}
