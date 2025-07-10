// src/modules/users/dto/change-password.dto.ts
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: '当前密码' })
  @IsString({ message: '当前密码必须是字符串' })
  @IsNotEmpty({ message: '当前密码不能为空' })
  currentPassword: string;

  @ApiProperty({
    description: '新密码',
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
