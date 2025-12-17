import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserFcmToken, UserFcmTokenSchema } from './schemas/user-fcm-token.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserFcmToken.name, schema: UserFcmTokenSchema }])],
  providers: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
