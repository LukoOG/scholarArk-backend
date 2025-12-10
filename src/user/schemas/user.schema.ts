import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Gender, UserRole } from 'src/common/enums';
import { Email, Name, Nonce, Phone, Wallet } from 'src/common/schemas';

export type UserDocument = HydratedDocument<User>;

/**
 * All attributes are not required by default.
 * We will modify to suit the app's requirements.
 */
@Schema({ timestamps: true })
export class User {
	///
	_id?: Types.ObjectId;  
	
  @Prop()
  first_name: string;
  
  @Prop()
  last_name: string;
  
  @Prop({ type: Email })
  email: Email;
  
  @Prop()
  googleId?: string;
  
  @Prop({ default: "local" })
  authProvider: "local" | "google" | "apple";

  @Prop({ type: Phone })
  phone?: Phone;
  
  @Prop({ type: String, enum: Gender })
  gender?: Gender;

  @Prop({ type: Date })
  birthday?: Date;
  
  @Prop({ type: String, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;
  
  @Prop({ type: [Types.ObjectId], ref: "Topic", default: [] })
  topicsIds: string[];
  
  @Prop({ type: [Types.ObjectId], ref: "Preference", default: [] })
  preferencesIds: string[];
  
  @Prop({ type: [Types.ObjectId], ref: "Goal", default: [] })
  goalsIds: string[];
  
  @Prop()
  stars?: number;

  @Prop()
  profile_pic: string;
  
  @Prop()
  password?: string;
  
  @Prop({
	  enum: ['ACCOUNT_CREATED', 'PROFILE_COMPLETED', 'PREFERENCES_COMPLETED'],
	  default: 'ACCOUNT_CREATED',
	})

	onboardingStatus: string;

  @Prop({ type: Nonce })
  nonce?: Nonce;  
  
  @Prop({ type: Wallet })
  wallet?: Wallet;
  
  @Prop()
  refresh_token?: string;
  
  @Prop({ type: Number, min: 0, default: 0 })
  unreadNotifications?: number;
  
  //virtuals
  fullName?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
