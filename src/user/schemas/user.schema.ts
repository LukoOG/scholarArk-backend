import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Gender, UserRole } from 'src/common/enums';
import { Email, Name, Nonce, Phone, Wallet } from 'src/common/schemas';

export type UserDocument = HydratedDocument<User>;


type AuthProviders = {
  local: boolean;
  google: boolean;
  apple?: boolean;
  facebook?: boolean;
};


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
  
  @Prop({ type: String, unique: true, sparse: true })
  googleId?: string;
  
  @Prop({
	  type: {
		local: { type: Boolean, default: false },
		google: { type: Boolean, default: false },
		apple: { type: Boolean, default: false },
		facebook: { type: Boolean, default: false },
	  },
	  default: () => ({
		local: false,
		google: false,
		apple: false,
		facebook: false,
	  }),
	})
	authProviders: AuthProviders;


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
  
  ///
  @Prop({ 
	type: { 
		otpHash: { type: String }, 
		expiry: { type: Date } 
		},
		_id: false,
	})
  passwordReset: {
	  otpHash: string,
	  expiry: Date
  }
  
  @Prop()
  fcmToken?: string
}

export const UserSchema = SchemaFactory.createForClass(User);
