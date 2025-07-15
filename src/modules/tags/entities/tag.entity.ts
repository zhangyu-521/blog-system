import { ApiProperty } from '@nestjs/swagger';
import { Tag as PrismaTag } from '@prisma/client';

export class Tag implements PrismaTag {
  @ApiProperty({ description: '标签ID' })
  id: string;

  @ApiProperty({ description: '标签名称', maxLength: 50 })
  name: string;

  @ApiProperty({ description: '标签slug', maxLength: 50 })
  slug: string;

  @ApiProperty({ description: '标签描述', required: false })
  description: string | null;

  @ApiProperty({
    description: '标签颜色(十六进制)',
    required: false,
    maxLength: 7,
  })
  color: string | null;

  @ApiProperty({ description: '使用次数', default: 0 })
  useCount: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
