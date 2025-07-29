// src/modules/upload/dto/upload.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: '文件URL' })
  url: string;

  @ApiProperty({ description: '文件名' })
  filename: string;

  @ApiProperty({ description: '原始文件名' })
  originalName: string;

  @ApiProperty({ description: '文件大小（字节）' })
  size: number;

  @ApiProperty({ description: '文件类型' })
  mimetype: string;

  @ApiProperty({ description: '上传时间' })
  uploadedAt: Date;
}
