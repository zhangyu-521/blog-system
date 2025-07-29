// src/common/pipes/file-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  maxSize?: number; // 最大文件大小（字节）
  allowedMimeTypes?: string[]; // 允许的MIME类型
  allowedExtensions?: string[]; // 允许的文件扩展名
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions = {}) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('文件不能为空');
    }

    // 验证文件大小
    if (this.options.maxSize && file.size > this.options.maxSize) {
      throw new BadRequestException(
        `文件大小不能超过 ${this.formatFileSize(this.options.maxSize)}`,
      );
    }

    // 验证MIME类型
    if (
      this.options.allowedMimeTypes &&
      !this.options.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `不支持的文件类型，支持的类型：${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    // 验证文件扩展名
    if (this.options.allowedExtensions) {
      const extension = file.originalname.split('.').pop()?.toLowerCase();
      if (!extension || !this.options.allowedExtensions.includes(extension)) {
        throw new BadRequestException(
          `不支持的文件扩展名，支持的扩展名：${this.options.allowedExtensions.join(', ')}`,
        );
      }
    }

    return file;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
