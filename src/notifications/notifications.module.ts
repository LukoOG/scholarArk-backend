import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseService } from './firebase/firebase.service';

import { User, UserSchema } from 'src/user/schemas/user.schema';
import { UserFcmToken, UserFcmTokenSchema } from 'src/user/schemas/user-fcm-token.schema';

@Module({
  imports: [ MongooseModule.forFeature(
	  [
		{ name: User.name, schema: UserSchema },
		{ name: UserFcmToken.name, schema: UserFcmTokenSchema },
		]) ],
  providers: [NotificationsService, FirebaseService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
