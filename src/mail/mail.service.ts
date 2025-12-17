import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config'

@Injectable()
export class MailService {
	constructor(
		private readonly configService: ConfigService<Config, true>
	){}
  private resend = new Resend(this.configService.get("resend", { infer: true }));

  async sendPasswordReset(email: string, resetLink: string) {
    return this.resend.emails.send({
      from: 'ScholarArk <no-reply@scholarark.com>',
      to: email,
      subject: 'Reset your password',
	  //REACT TEMPLATE LATER
      html: `
        <p>You requested a password reset.</p>
        <p>
          <a href="${resetLink}">
            Reset your password
          </a>
        </p>
        <p>This link expires in 15 minutes.</p>
      `,
    });
  }

  async sendWelcomeEmail(email: string, name?: string) {
    return this.resend.emails.send({
      from: 'ScholarArk <welcome@scholarark.com>',
      to: email,
      subject: 'Welcome to ScholarArk 🎓',
      html: `<p>Welcome${name ? `, ${name}` : ''}!</p>`,
    });
  }
}
