// src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: DeepMockProxy<UsersService>;
  let jwtService: DeepMockProxy<JwtService>;
  let prisma: DeepMockProxy<PrismaService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    avatar: null,
    bio: null,
    refreshToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    emailVerificationToken: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordResetToken: null,
    passwordResetExpires: null,
    emailVerifyToken: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockDeep<UsersService>(),
        },
        {
          provide: JwtService,
          useValue: mockDeep<JwtService>(),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'jwt.accessTokenExpiration': '15m',
                'jwt.refreshTokenExpiration': '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('应该验证用户凭据并返回用户信息', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('当密码错误时应该返回null', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });

    it('当用户不存在时应该返回null', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('应该成功登录并返回tokens', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValueOnce(tokens.accessToken);
      jwtService.sign.mockReturnValueOnce(tokens.refreshToken);
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        }),
        ...tokens,
      });
    });

    it('当凭据无效时应该抛出异常', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      const newUser = { ...mockUser, ...registerDto };

      usersService.create.mockResolvedValue(newUser);
      jwtService.sign.mockReturnValueOnce('access-token');
      jwtService.sign.mockReturnValueOnce('refresh-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        user: expect.objectContaining({
          email: registerDto.email,
          username: registerDto.username,
        }),
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });
});
