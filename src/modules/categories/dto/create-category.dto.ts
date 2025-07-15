// src/modules/categories/dto/create-category.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: '分类名称',
    example: '技术',
    maxLength: 100,
  })
  @IsString({ message: '分类名称必须是字符串' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @MaxLength(100, { message: '分类名称最多100个字符' })
  name: string;

  @ApiPropertyOptional({
    description: '分类描述',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  @MaxLength(500, { message: '分类描述最多500个字符' })
  description?: string;

  @ApiPropertyOptional({
    description: '分类颜色（十六进制）',
    example: '#3B82F6',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsOptional()
  @IsString({ message: '分类颜色必须是字符串' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: '分类颜色必须是有效的十六进制颜色值',
  })
  color?: string;

  @ApiPropertyOptional({
    description: '分类图标',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '分类图标必须是字符串' })
  @MaxLength(50, { message: '分类图标最多50个字符' })
  icon?: string;

  @ApiPropertyOptional({
    description: '排序顺序',
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: '排序顺序必须是整数' })
  sortOrder?: number;

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
}
