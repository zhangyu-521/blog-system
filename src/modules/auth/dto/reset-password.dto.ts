// src/modules/auth/dto/reset-password.dto.ts
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: '邮箱地址',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: '重置令牌',
    example: 'reset-token-here',
  })
  @IsString({ message: '重置令牌必须是字符串' })
  @IsNotEmpty({ message: '重置令牌不能为空' })
  token: string;

  @ApiProperty({
    description: '新密码',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString({ message: '新密码必须是字符串' })
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(8, { message: '新密码至少8个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '新密码必须包含大小写字母、数字和特殊字符',
  })
  newPassword: string;
}
