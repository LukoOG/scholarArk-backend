import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config'
import { WelcomeEmail } from './templates/emails/welcome-email';

@Injectable()
export class MailService {
	
	private readonly resend: Resend;
	private readonly logger = new Logger(MailService.name);
	constructor(
		private readonly configService: ConfigService<Config, true>
	){
		this.resend = new Resend(this.configService.get("resend", { infer: true }))
	}
	
  async sendPasswordReset(email: string, token: string) {
    try{
		await this.resend.emails.send({
			from: "ScholarArk <noreply@scholarark.com>",
			to: [email],
			subject: "Password Reset OTP!",
			html: `
			<p>You requested a password reset.</p>
			<p>
			  <p> OTP is: ${token}
			</p>
			<p>This link expires in 15 minutes.</p>
		  `
		})
	}catch(error){
		this.logger.error(`Failed to send email to ${email}`, error?.stack ?? error?.message ?? JSON.stringify(error),)  
	};
  }

  async sendWelcomeEmail(email: string, name?: string) {
	  try{
		await this.resend.emails.send({
			from: "ScholarArk <noreply@scholarark.com>",
			to: [email],
			subject: "Welcome to Scholar Ark 🎉",
			react: WelcomeEmail({name})
		  });  
	  }catch(error){
		this.logger.error(`Failed to send email to ${email}`, error?.stack ?? error?.message ?? JSON.stringify(error),)  
		console.error(`Failed to send email to ${email}`, error)  
	  }
  }
}
