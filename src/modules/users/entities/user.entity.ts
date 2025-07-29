// src/modules/users/entities/user.entity.ts (更新)
import { User, UserRole, UserStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  @ApiProperty({
    description: '用户ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'user@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: '用户名',
    example: 'johndoe',
    minLength: 3,
    maxLength: 20,
  })
  username: string;

  @ApiPropertyOptional({
    description: '名字',
    example: 'John',
    maxLength: 50,
  })
  firstName: string | null;

  @ApiPropertyOptional({
    description: '姓氏',
    example: 'Doe',
    maxLength: 50,
  })
  lastName: string | null;

  @ApiPropertyOptional({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatar: string | null;

  @ApiPropertyOptional({
    description: '个人简介',
    example: '这是我的个人简介',
    maxLength: 500,
  })
  bio: string | null;

  @ApiProperty({
    description: '用户角色',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: '用户状态',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: '邮箱验证状态',
    example: true,
  })
  emailVerified: boolean;

  @ApiPropertyOptional({
    description: '最后登录时间',
    example: '2023-12-01T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  lastLoginAt: Date | null;

  @ApiProperty({
    description: '创建时间',
    example: '2023-12-01T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2023-12-01T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;

  // 排除敏感字段
  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string | null;

  @Exclude()
  resetPasswordToken: string | null;

  @Exclude()
  resetPasswordExpires: Date | null;

  @Exclude()
  emailVerificationToken: string | null;

  @Exclude()
  passwordResetToken: string | null;

  @Exclude()
  passwordResetExpires: Date | null;

  @Exclude()
  emailVerifyToken: string | null;

  constructor(user: User) {
    Object.assign(this, user);
  }
}
