import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryCategoryDto {
  @ApiPropertyOptional({ description: '分类名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '分类状态' })
  @IsString()
  @IsOptional()
  status?: string;
}
