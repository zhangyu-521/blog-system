// src/modules/notification/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

export interface NotificationOptions {
  type: 'email' | 'sms' | 'push';
  recipient: string;
  title: string;
  content: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private mailService: MailService) {}

  async send(options: NotificationOptions): Promise<void> {
    try {
      switch (options.type) {
        case 'email':
          await this.sendEmail(options);
          break;
        case 'sms':
          await this.sendSMS(options);
          break;
        case 'push':
          await this.sendPush(options);
          break;
        default:
          throw new Error(`不支持的通知类型: ${options.type}`);
      }
    } catch (error) {
      this.logger.error(`通知发送失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async sendEmail(options: NotificationOptions): Promise<void> {
    await this.mailService.sendMail({
      to: options.recipient,
      subject: options.title,
      html: options.content,
    });
  }

  private async sendSMS(options: NotificationOptions): Promise<void> {
    // 实现短信发送逻辑
    this.logger.log(`发送短信到 ${options.recipient}: ${options.content}`);
  }

  private async sendPush(options: NotificationOptions): Promise<void> {
    // 实现推送通知逻辑
    this.logger.log(`发送推送通知到 ${options.recipient}: ${options.title}`);
  }

  // 批量发送通知
  async sendBatch(notifications: NotificationOptions[]): Promise<void> {
    const promises = notifications.map((notification) =>
      this.send(notification),
    );
    await Promise.allSettled(promises);
  }

  // 发送系统通知
  async sendSystemNotification(
    recipients: string[],
    title: string,
    content: string,
  ): Promise<void> {
    const notifications = recipients.map((recipient) => ({
      type: 'email' as const,
      recipient,
      title,
      content,
    }));

    await this.sendBatch(notifications);
  }
}
