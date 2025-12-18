import { IsString } from 'class-validator';

export class SaveFcmTokenDto {
	@IsString()
	fcmToken: string;
	
	@IsString()
	device?: string;
}