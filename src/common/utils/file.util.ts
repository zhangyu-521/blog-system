// src/common/utils/file.util.ts
import * as path from 'path';
import * as fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export class FileUtil {
  /**
   * 获取文件扩展名
   */
  static getExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  /**
   * 获取文件名（不含扩展名）
   */
  static getBasename(filename: string): string {
    return path.basename(filename, path.extname(filename));
  }

  /**
   * 生成唯一文件名
   */
  static generateUniqueFilename(originalName: string): string {
    const ext = this.getExtension(originalName);
    const basename = this.getBasename(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${basename}-${timestamp}-${random}${ext}`;
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 检查文件是否存在
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 创建目录（如果不存在）
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // 忽略目录已存在的错误
      if ((error as any).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * 复制文件
   */
  static async copyFile(src: string, dest: string): Promise<void> {
    await this.ensureDir(path.dirname(dest));
    await pipeline(createReadStream(src), createWriteStream(dest));
  }

  /**
   * 删除文件
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // 忽略文件不存在的错误
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 获取文件信息
   */
  static async getFileInfo(filePath: string) {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    };
  }

  /**
   * 读取文件内容
   */
  static async readFile(
    filePath: string,
    encoding: BufferEncoding = 'utf8',
  ): Promise<string> {
    return fs.readFile(filePath, encoding);
  }

  /**
   * 写入文件内容
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
  }
}
