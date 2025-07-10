// src/modules/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: '邮箱地址',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({
    description: '用户名',
    example: 'johndoe',
    minLength: 3,
    maxLength: 20,
  })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '用户名只能包含字母、数字和下划线',
  })
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(8, { message: '密码至少8个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '密码必须包含大小写字母、数字和特殊字符',
  })
  password: string;

  @ApiPropertyOptional({
    description: '名字',
    example: 'John',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '名字必须是字符串' })
  @MaxLength(50, { message: '名字最多50个字符' })
  firstName?: string;

  @ApiPropertyOptional({
    description: '姓氏',
    example: 'Doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '姓氏必须是字符串' })
  @MaxLength(50, { message: '姓氏最多50个字符' })
  lastName?: string;

  @ApiPropertyOptional({
    description: '头像URL',
    format: 'uri',
  })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;

  @ApiPropertyOptional({
    description: '个人简介',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '个人简介必须是字符串' })
  @MaxLength(500, { message: '个人简介最多500个字符' })
  bio?: string;

  @ApiPropertyOptional({
    description: '用户角色',
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: '无效的用户角色' })
  role?: UserRole;
}
