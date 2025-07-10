// src/modules/users/entities/user.entity.ts
import { User, UserRole, UserStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity implements Omit<User, 'password'> {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  firstName: string | null;

  @ApiProperty({ required: false })
  lastName: string | null;

  @ApiProperty({ required: false })
  avatar: string | null;

  @ApiProperty({ required: false })
  bio: string | null;

  @ApiProperty({ enum: ['USER', 'ADMIN', 'MODERATOR'] })
  role: UserRole;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'BANNED'] })
  status: UserStatus;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // 排除密码字段
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  emailVerifyToken: string | null;

  constructor(user: User) {
    Object.assign(this, user);
    delete (this as any).password;
  }
}
