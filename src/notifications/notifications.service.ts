import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { UserFcmToken, UserFcmTokenDocument } from 'src/user/schemas/user-fcm-token.schema';
import { Model, Types, HydratedDocument } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FirebaseService } from './firebase/firebase.service';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(UserFcmToken.name) private fcmTokenModel: Model<UserFcmTokenDocument>,
		private readonly firebaseService: FirebaseService
	){};

	@Cron(CronExpression.EVERY_DAY_AT_5PM)
	async sendDailyReminders(){
		console.log("sending daily reminders");
		
		const users = await this.userModel.find({
			remindersEnabled: true
		})
		.select('_id first_name')
		.lean();
		
		const userIds = users.map(u => u._id);
		
		const tokens = 	await this.fcmTokenModel.find({
			userId: { $in: userIds },
			isActive: true,
		})
		.lean();
		
		const tokenMap = new Map<string, string[]>();

		for (const t of tokens) {
		  const key = t.userId.toString();
		  if (!tokenMap.has(key)) tokenMap.set(key, []);
		  tokenMap.get(key)!.push(t.token);
		}
		
		for (const user of users) {
		  const userTokens = tokenMap.get(user._id.toString());
		  if (!userTokens?.length) continue;

		  await this.firebaseService.sendNotification(userTokens, {
			title: `Hey ${user.first_name} 👋`,
			body: "Don't forget to continue your courses today!",
			data: {
			  type: 'DAILY_REMINDER',
			},
		  });
		}
	};
	
	//async welcomeNotification(){};
}
