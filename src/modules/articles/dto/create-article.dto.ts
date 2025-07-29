// src/modules/articles/dto/create-article.dto.ts (更新示例)
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';

export class CreateArticleDto {
  @ApiProperty({
    description: '文章标题',
    example: 'NestJS 实战指南：从入门到精通',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  @MaxLength(255, { message: '标题最多255个字符' })
  title: string;

  @ApiProperty({
    description: '文章内容',
    example: '这是一篇关于 NestJS 的详细教程，涵盖了从基础到高级的所有内容...',
  })
  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @ApiPropertyOptional({
    description: '文章摘要',
    example: '学习如何使用 NestJS 构建企业级应用程序',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '摘要必须是字符串' })
  @MaxLength(500, { message: '摘要最多500个字符' })
  excerpt?: string;

  @ApiPropertyOptional({
    description: '封面图片URL',
    example: 'https://example.com/cover.jpg',
  })
  @IsOptional()
  @IsString({ message: '封面图片URL必须是字符串' })
  coverImage?: string;

  @ApiProperty({
    description: '分类ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID(4, { message: '分类ID必须是有效的UUID' })
  @IsNotEmpty({ message: '分类ID不能为空' })
  categoryId: string;

  @ApiPropertyOptional({
    description: '标签ID列表',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
  })
  @IsOptional()
  @IsArray({ message: '标签ID必须是数组' })
  @IsUUID(4, { each: true, message: '每个标签ID必须是有效的UUID' })
  tagIds?: string[];

  @ApiPropertyOptional({
    description: '文章状态',
    enum: ArticleStatus,
    example: ArticleStatus.DRAFT,
    default: ArticleStatus.DRAFT,
  })
  @IsOptional()
  status?: ArticleStatus;

  @ApiPropertyOptional({
    description: '是否允许评论',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: '允许评论必须是布尔值' })
  allowComments?: boolean;

  // SEO 相关字段
  @ApiPropertyOptional({
    description: 'SEO标题',
    example: 'NestJS 实战指南 - 最全面的 NestJS 教程',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'SEO标题必须是字符串' })
  @MaxLength(255, { message: 'SEO标题最多255个字符' })
  metaTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO描述',
    example: '这是一篇全面的 NestJS 教程，适合初学者和有经验的开发者',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'SEO描述必须是字符串' })
  @MaxLength(500, { message: 'SEO描述最多500个字符' })
  metaDescription?: string;

  @ApiPropertyOptional({
    description: 'SEO关键词',
    example: 'NestJS, Node.js, TypeScript, 后端开发, API',
  })
  @IsOptional()
  @IsString({ message: 'SEO关键词必须是字符串' })
  metaKeywords?: string;
}
