// src/modules/upload/upload.controller.ts
import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload.dto';
import { FileValidationPipe } from '../../common/pipes/file-validation.pipe';

@ApiTags('文件上传')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传图片' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '上传成功',
    type: UploadResponseDto,
  })
  async uploadImage(
    @UploadedFile(
      new FileValidationPipe({
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.uploadService.uploadImage(file);
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传文档' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '上传成功',
    type: UploadResponseDto,
  })
  async uploadDocument(
    @UploadedFile(
      new FileValidationPipe({
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'text/plain',
          'application/msword',
        ],
        allowedExtensions: ['pdf', 'txt', 'doc', 'docx'],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.uploadService.uploadDocument(file);
  }

  @Delete('image/:filename')
  @ApiOperation({ summary: '删除图片' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async deleteImage(@Param('filename') filename: string): Promise<void> {
    return this.uploadService.deleteFile(filename, 'images');
  }

  @Delete('document/:filename')
  @ApiOperation({ summary: '删除文档' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async deleteDocument(@Param('filename') filename: string): Promise<void> {
    return this.uploadService.deleteFile(filename, 'documents');
  }
}
