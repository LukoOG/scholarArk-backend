import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config'

@Injectable()
export class MailService {
	
	private readonly resend: Resend;
	private readonly logger = new Logger(MailService.name);
	constructor(
		private readonly configService: ConfigService<Config, true>
	){
		this.resend = new Resend(this.configService.get("resend", { infer: true }))
	}
	
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
	  try{
		await this.resend.emails.send({
			from: "ScholarArk <noreply@scholarark.com>",
			to: email,
			subject: "Welcome to Scholar Ark 🎉",
			html: `
			  <h2>Welcome${name ? `, ${name}` : ''}!</h2>
			  <p>We’re excited to have you on ScholarArk.</p>
			  <p>You can now explore courses, assessments and reminders.</p>
			  <br />
			  <p>🚀 The ScholarArk Team</p>
			`,
		  });  
	  }catch(error){
		this.logger.error(`Failed to send email to ${email}`, error)  
	  }
  }
}
