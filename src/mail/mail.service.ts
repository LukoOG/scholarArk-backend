import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config'
import { WelcomeEmail } from './templates/emails/welcome-email';
import { VerificationEmail } from './templates/emails/verification-email';
import { OTP } from './templates/emails';

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
			react: OTP({ token })
		})
	}catch(error){
		this.logger.error(`Failed to send email to ${email}`, error?.stack ?? error?.message ?? JSON.stringify(error),)  
	};
  }

  async sendVerificationEmail(email: string, token: string) {
	try{
		await this.resend.emails.send({
			from: "ScholarArk <noreply@scholarark.com>",
			to: [email],
			subject: "Verify your email",
			react: VerificationEmail({token}),
		})
	}catch(error){
		this.logger.error(`Failed to send email to ${email}`, error?.stack ?? error?.message ?? JSON.stringify(error),)  
		console.error(`Failed to send email to ${email}`, error)  
	}
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
