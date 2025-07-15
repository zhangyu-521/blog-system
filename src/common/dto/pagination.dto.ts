import { IsOptional, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsPositive()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
