// src/modules/upload/upload.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as sharp from 'sharp';
import { FileUtil } from '../../common/utils/file.util';
import { UploadResponseDto } from './dto/upload.dto';

@Injectable()
export class UploadService {
  private readonly uploadPath: string;
  private readonly maxFileSize: number;
  private readonly allowedImageTypes: string[];
  private readonly allowedDocumentTypes: string[];

  constructor(private configService: ConfigService) {
    this.uploadPath =
      this.configService.get<string>('upload.path') || './uploads';
    this.maxFileSize =
      this.configService.get<number>('upload.maxSize') || 10 * 1024 * 1024; // 10MB
    this.allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    this.allowedDocumentTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
    ];
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadResponseDto> {
    this.validateImageFile(file);

    const filename = FileUtil.generateUniqueFilename(file.originalname);
    const uploadDir = path.join(this.uploadPath, 'images');
    const filePath = path.join(uploadDir, filename);

    try {
      // 确保上传目录存在
      await FileUtil.ensureDir(uploadDir);

      // 处理图片（压缩、调整大小）
      await sharp(file.buffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toFile(filePath);

      // 生成缩略图
      const thumbnailPath = path.join(uploadDir, 'thumbnails', filename);
      await FileUtil.ensureDir(path.dirname(thumbnailPath));
      await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return {
        url: `/uploads/images/${filename}`,
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date(),
      };
    } catch (error) {
      throw new InternalServerErrorException('文件上传失败', error);
    }
  }

  async uploadDocument(file: Express.Multer.File): Promise<UploadResponseDto> {
    this.validateDocumentFile(file);

    const filename = FileUtil.generateUniqueFilename(file.originalname);
    const uploadDir = path.join(this.uploadPath, 'documents');
    const filePath = path.join(uploadDir, filename);

    try {
      await FileUtil.ensureDir(uploadDir);
      await FileUtil.writeFile(filePath, file.buffer.toString('base64'));

      return {
        url: `/uploads/documents/${filename}`,
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date(),
      };
    } catch (error) {
      throw new InternalServerErrorException('文件上传失败', error);
    }
  }

  async deleteFile(
    filename: string,
    type: 'images' | 'documents',
  ): Promise<void> {
    const filePath = path.join(this.uploadPath, type, filename);

    try {
      await FileUtil.deleteFile(filePath);

      // 如果是图片，同时删除缩略图
      if (type === 'images') {
        const thumbnailPath = path.join(
          this.uploadPath,
          type,
          'thumbnails',
          filename,
        );
        await FileUtil.deleteFile(thumbnailPath);
      }
    } catch (error) {
      throw new InternalServerErrorException('文件删除失败', error);
    }
  }

  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('请选择文件');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `文件大小不能超过 ${FileUtil.formatFileSize(this.maxFileSize)}`,
      );
    }

    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `不支持的图片格式，支持格式：${this.allowedImageTypes.join(', ')}`,
      );
    }
  }

  private validateDocumentFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('请选择文件');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `文件大小不能超过 ${FileUtil.formatFileSize(this.maxFileSize)}`,
      );
    }

    if (!this.allowedDocumentTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `不支持的文档格式，支持格式：${this.allowedDocumentTypes.join(', ')}`,
      );
    }
  }
}
