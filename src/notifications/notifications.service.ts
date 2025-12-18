import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Model, Types, HydratedDocument } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FirebaseService } from './firebase/firebase.service';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private readonly firebaseService: FirebaseService
	){};

	@Cron(CronExpression.EVERY_DAY_AT_8AM)
	async sendDailyReminders(){
		console.log("sending daily reminders");
		
		const users = await this.userModel.find({
			fcmToken: { $exists: true, $ne: null },
			remindersEnabled: true,
		})
				
		/*
		const tokens = users.map(u => u.fcmToken);
		
		await this.firebaseService.sendNotification(tokens, {
			title: "Daily Schedule Reminder",
			body: "Don't forget to continue your courses today"
		})
		*/
		
		for(const user of users){
			await this.firebaseService.sendNotification(
				[user.fcmToken],
				{
					title: `Hey there ${user.first_name}👋`,
					body: "Make sure you finish up your courses today",
					//can pass data of course Id for mobile devs to deep link
				}
			)
		};
		
	};
	

}
