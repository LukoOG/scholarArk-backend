import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserFcmToken, UserFcmTokenDocument } from './schemas/user-fcm-token.schema';
import { Model, Types, HydratedDocument } from 'mongoose';
import { SaveFcmTokenDto } from './dto/save-fcm-token.dto';

@Injectable()
export class NotificationsService {
	constructor(@InjectModel(UserFcmToken.name) private fcmTokenModel: Model<UserFcmTokenDocument>){};
	
	async saveFcmToken(userId: Types.ObjectId, dto: SaveFcmTokenDto) {
	  await this.fcmTokenModel.findOneAndUpdate(
		{ token: dto.fcmToken },
		{
		  userId,
		  isActive: true,
		  device: dto.device,
		},
		{ upsert: true, new: true },
	  );
	}

}
