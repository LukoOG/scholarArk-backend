import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseService } from './firebase/firebase.service';

import { User, UserSchema } from 'src/user/schemas/user.schema';

@Module({
  imports: [ MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]) ],
  providers: [NotificationsService, FirebaseService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
