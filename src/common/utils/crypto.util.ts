// src/common/utils/crypto.util.ts
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export class CryptoUtil {
  /**
   * 生成随机字符串
   */
  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * 生成UUID
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * MD5哈希
   */
  static md5(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * SHA256哈希
   */
  static sha256(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * 密码哈希
   */
  static async hashPassword(
    password: string,
    rounds: number = 12,
  ): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  /**
   * 验证密码
   */
  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * AES加密
   */
  static encrypt(text: string, key: string): string {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * AES解密
   */
  static decrypt(encryptedText: string, key: string): string {
    const algorithm = 'aes-256-cbc';
    const textParts = encryptedText.split(':');
    const encrypted = textParts.join(':');
    const decipher = crypto.createDecipher(algorithm, key);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * 生成JWT密钥
   */
  static generateJWTSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}
