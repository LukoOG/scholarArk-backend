import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type UserFcmTokenDocument = HydratedDocument<UserFcmToken>

export enum DevicePlatform {
	ANDROID = 'android',
	IOS = 'ios',
	WEB = 'web',
}

@Schema({ timestamps: true })
export class UserFcmToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ default: true })
  isActive: boolean;
  
  @Prop({ default: Date.now })
  lastSeenAt: Date;
  
  @Prop({ enum: DevicePlatform })
  devicePlatform?: DevicePlatform;
}

export const UserFcmTokenSchema =
  SchemaFactory.createForClass(UserFcmToken);
