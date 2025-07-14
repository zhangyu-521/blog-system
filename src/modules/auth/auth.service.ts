// src/modules/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '@prisma/client';
import { UserEntity } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserEntity;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    // 检查用户状态
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('用户账户已被禁用');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      password,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: new UserEntity(user),
      tokens,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const user = await this.usersService.create(registerDto);
      const tokens = await this.generateTokens(user as User);

      return {
        user,
        tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('注册失败');
    }
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('用户账户已被禁用');
      }

      return this.generateTokens(user as User);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    const { email } = forgotPasswordDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // 为了安全，不暴露用户是否存在
      return;
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15分钟后过期

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // TODO: 发送重置密码邮件
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    console.log(`密码重置令牌: ${resetToken}`); // 开发环境下打印令牌
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('重置令牌无效或已过期');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  async logout(userId: string): Promise<void> {
    // 在实际应用中，你可能需要将令牌加入黑名单
    // 这里只是一个占位符实现
    console.log(`用户 ${userId} 已登出`);
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(),
    };
  }

  private getTokenExpirationTime(): number {
    const expiresIn = this.configService.get<string>('jwt.expiresIn');
    // 简单解析过期时间（如 '1d' -> 86400 秒）
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60;
    } else if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    }
    return parseInt(expiresIn);
  }
}
