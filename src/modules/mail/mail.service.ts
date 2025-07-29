// src/modules/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from 'path';
import { FileUtil } from '../../common/utils/file.util';

export interface MailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private templatesPath: string;

  constructor(private configService: ConfigService) {
    this.templatesPath = path.join(process.cwd(), 'src/modules/mail/templates');
    this.createTransporter();
  }

  private createTransporter(): void {
    const config = {
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<boolean>('mail.secure'),
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.password'),
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendMail(options: MailOptions): Promise<void> {
    try {
      let html = options.html;

      // 如果指定了模板，渲染模板
      if (options.template) {
        html = await this.renderTemplate(
          options.template,
          options.context || {},
        );
      }

      const mailOptions = {
        from: this.configService.get<string>('mail.from'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
        text: options.text,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`邮件发送成功: ${result.messageId}`);
    } catch (error) {
      this.logger.error('邮件发送失败:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, username: string): Promise<void> {
    await this.sendMail({
      to,
      subject: '欢迎注册！',
      template: 'welcome',
      context: {
        username,
        loginUrl: `${this.configService.get<string>('app.url')}/login`,
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('app.url')}/reset-password?token=${resetToken}`;

    await this.sendMail({
      to,
      subject: '密码重置',
      template: 'password-reset',
      context: {
        resetUrl,
        expiresIn: '1小时',
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('app.url')}/verify-email?token=${verificationToken}`;

    await this.sendMail({
      to,
      subject: '邮箱验证',
      template: 'email-verification',
      context: {
        verificationUrl,
      },
    });
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      const templateContent = await FileUtil.readFile(templatePath);
      const template = handlebars.compile(templateContent);
      return template(context);
    } catch (error) {
      this.logger.error(`模板渲染失败: ${templateName}`, error);
      throw new Error(`邮件模板渲染失败: ${templateName}`);
    }
  }
}
