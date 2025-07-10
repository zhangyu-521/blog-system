// src/modules/users/users.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User, UserStatus, Prisma } from '@prisma/client';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { email, username, password, ...rest } = createUserDto;

    // 检查用户是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('邮箱已被使用');
      }
      if (existingUser.username === username) {
        throw new ConflictException('用户名已被使用');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      // 创建用户
      const user = await this.prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          ...rest,
        },
      });

      return new UserEntity(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('邮箱或用户名已存在');
        }
      }
      throw error;
    }
  }

  async findAll(queryDto: QueryUserDto) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      emailVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (emailVerified !== undefined) {
      where.emailVerified = emailVerified;
    }

    // 构建排序条件
    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => new UserEntity(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? new UserEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查用户名是否已被其他用户使用
    if (updateUserDto.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username: updateUserDto.username,
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new ConflictException('用户名已被使用');
      }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      return new UserEntity(updatedUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('用户名已存在');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('当前密码错误');
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('新密码不能与当前密码相同');
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
      },
    });
  }

  async updateStatus(id: string, status: UserStatus): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    return new UserEntity(updatedUser);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async getUserStats(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const [articleCount, commentCount] = await Promise.all([
      this.prisma.article.count({
        where: { authorId: id },
      }),
      this.prisma.comment.count({
        where: { authorId: id },
      }),
    ]);

    return {
      user,
      stats: {
        articleCount,
        commentCount,
        joinedDays: Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        ),
      },
    };
  }
}
