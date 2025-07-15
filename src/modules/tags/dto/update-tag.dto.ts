import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateTagDto } from './create-tag.dto';

export class UpdateTagDto implements Partial<CreateTagDto> {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  description?: string;
}
