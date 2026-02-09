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
  ) { };

  @Cron(CronExpression.EVERY_DAY_AT_5PM)
  async sendDailyReminders() {
    console.log("sending daily reminders");

    const users = await this.userModel.find({
      remindersEnabled: true
    })
      .select('_id first_name')
      .lean();

    const userIds = users.map(u => u._id);

    const tokens = await this.fcmTokenModel.find({
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

  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async sendEveningReminder() {
    await this.sendBulkNotification({
      title: 'Good evening 👋',
      body: 'Take a moment to continue your learning on ScholarArk 📚',
      type: 'EVENING_REMINDER',
    });
  }

  // 🔔 8:30 PM notification
  //@Cron('30 20 * * *')
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_9PM)
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_3PM)
  async sendLateEveningReminder() {
    await this.sendBulkNotification({
      title: 'Still time to learn ⏰',
      body: 'Just 10–15 minutes of study can make a difference!',
      type: 'LATE_EVENING_REMINDER',
    });
  }

  private async sendBulkNotification(payload: {
    title: string;
    body: string;
    type: string;
  }) {
    console.log(`🔔 Sending ${payload.type}`);

    // 1. Fetch users (NO remindersEnabled check)
    const users = await this.userModel
      .find({})
      .select('_id first_name')
      .lean();

    if (!users.length) return;

    const userIds = users.map((u) => u._id);

    // 2. Fetch active tokens
    const tokens = await this.fcmTokenModel
      .find({
        userId: { $in: userIds },
        isActive: true,
      })
      .lean();

    if (!tokens.length) return;

    // 3. Group tokens by user
    const tokenMap = new Map<string, string[]>();

    for (const token of tokens) {
      const key = token.userId.toString();
      if (!tokenMap.has(key)) tokenMap.set(key, []);
      tokenMap.get(key)!.push(token.token);
    }

    // 4. Send notifications per user (personalized)
    for (const user of users) {
      const userTokens = tokenMap.get(user._id.toString());
      if (!userTokens?.length) continue;

      await this.firebaseService.sendNotification(userTokens, {
        title: `${payload.title}${user.first_name ? ` ${user.first_name}` : ''}`,
        body: payload.body,
        data: {
          type: payload.type,
        },
      });
    }
  }
}
