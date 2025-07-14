// src/modules/auth/dto/register.dto.ts
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { OmitType } from '@nestjs/swagger';

export class RegisterDto extends OmitType(CreateUserDto, ['role'] as const) {}
