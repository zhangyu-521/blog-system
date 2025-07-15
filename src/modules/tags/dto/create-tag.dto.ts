import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @IsString()
  @MaxLength(128)
  description?: string;

  @IsString()
  @MaxLength(7)
  color?: string;
}
