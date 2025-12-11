import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendPasswordResetEmail(email: string, token: string, name: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const templatePath = path.join(
      process.cwd(),
      'dist/mail/templates/reset-password.html',
    );

    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    htmlContent = htmlContent.replace('{{name}}', name);
    htmlContent = htmlContent.replace('{{link}}', resetLink);

    try {
      await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Redefinição de senha - Bonus Hunt',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }
}
