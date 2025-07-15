// src/modules/comments/dto/create-comment.dto.ts
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: '评论内容',
    example: '这篇文章写得很好！',
    maxLength: 1000,
  })
  @IsString({ message: '评论内容必须是字符串' })
  @IsNotEmpty({ message: '评论内容不能为空' })
  @MaxLength(1000, { message: '评论内容最多1000个字符' })
  content: string;

  @ApiProperty({
    description: '文章ID',
  })
  @IsNotEmpty({ message: '文章ID不能为空' })
  articleId: string;

  @ApiPropertyOptional({
    description: '父评论ID（回复评论时使用）',
  })
  @IsOptional()
  parentId?: string;
}
