// src/modules/users/dto/query-user.dto.ts
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class QueryUserDto {
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
    description: '用户角色',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: '无效的用户角色' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: '用户状态',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '无效的用户状态' })
  status?: UserStatus;

  @ApiPropertyOptional({
    description: '排序字段',
    default: 'createdAt',
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

  @ApiPropertyOptional({
    description: '是否只显示已验证邮箱的用户',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: '邮箱验证状态必须是布尔值' })
  emailVerified?: boolean;
}
