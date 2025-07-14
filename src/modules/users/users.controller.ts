// src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserEntity } from './entities/user.entity';
import { User, UserStatus } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(RolesGuard) // 启用角色守卫
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN) // 只有管理员可以创建用户
  @Post()
  @ApiOperation({ summary: '创建用户（管理员）' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.usersService.create(createUserDto);
  }

  @Roles(UserRole.ADMIN, UserRole.MODERATOR) // 管理员和版主可以查看用户列表
  @Get()
  @ApiOperation({ summary: '获取用户列表（管理员/版主）' })
  async findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto);
  }

  @Get('me') // 获取当前用户信息，无需特殊权限
  @ApiOperation({ summary: '获取当前用户信息' })
  async getCurrentUser(@CurrentUser() user: User): Promise<UserEntity> {
    return new UserEntity(user);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户信息' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserEntity> {
    // 用户只能查看自己的信息，管理员和版主可以查看所有用户
    if (
      currentUser.id !== id &&
      !['ADMIN', 'MODERATOR'].includes(currentUser.role)
    ) {
      throw new ForbiddenException('无权访问其他用户信息');
    }

    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  @Patch('me') // 更新当前用户信息
  @ApiOperation({ summary: '更新当前用户信息' })
  async updateCurrentUser(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.update(userId, updateUserDto);
  }

  @Roles(UserRole.ADMIN) // 只有管理员可以更新其他用户
  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息（管理员）' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('me/password') // 修改当前用户密码
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '修改当前用户密码' })
  async changeCurrentUserPassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Roles(UserRole.ADMIN) // 只有管理员可以更新用户状态
  @Patch(':id/status')
  @ApiOperation({ summary: '更新用户状态（管理员）' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ): Promise<UserEntity> {
    return this.usersService.updateStatus(id, status);
  }

  @Roles(UserRole.ADMIN) // 只有管理员可以删除用户
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除用户（管理员）' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
