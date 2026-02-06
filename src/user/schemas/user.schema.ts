import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Gender, UserRole } from 'src/common/enums';
import { Email, EmailVerification, Name, Nonce, Phone, Wallet } from 'src/common/schemas';
import mongoose from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export const PRIVATE_FIELDS = [
  'password',
  'refresh_token',
  'onboardingStatus',
  'passwordReset',
  'authProviders',
  'googleId',
  'emailVerification',
  'nonce',
  'wallet',
  'unreadNotifications',
  'remindersEnabled'
];

type AuthProviders = {
  local: boolean;
  google: boolean;
  apple?: boolean;
  facebook?: boolean;
};

@Schema({ _id: false })
class OnboardingStatus {
  @Prop({ default: false })
  hasAcceptedTerms: boolean;

  @Prop({ type: Date })
  termsAcceptedAt?: Date;

  @Prop({ default: false })
  isProfileComplete: boolean;

  @Prop({ default: false })
  isMetaComplete: boolean;

  @Prop({ default: false })
  isOnboardingComplete: boolean;
}

@Schema({ timestamps: true })
export class User {
  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ type: Email })
  email: Email;

  @Prop({ type: EmailVerification })
  emailVerification?: EmailVerification;

  @Prop({ type: String, unique: true, sparse: true })
  googleId?: string;

  @Prop({
    _id: false,
    type: {
      local: { type: Boolean, default: false },
      google: { type: Boolean, default: false },
      apple: { type: Boolean, default: false },
      facebook: { type: Boolean, default: false },
    },
    required: true
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

  //Filtering information
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: "Course" })
  completedCourseIds: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  subscribedTutorIds: Types.ObjectId[];

  @Prop()
  stars?: number;

  @Prop()
  profile_pic: string;

  @Prop()
  password?: string;

  @Prop({ type: OnboardingStatus, required: true })
  onboardingStatus: OnboardingStatus;

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

  @Prop({ type: Boolean, default: false })
  remindersEnabled: boolean;

  @Prop()
  fcmToken?: string
}

export const UserSchema = SchemaFactory.createForClass(User);
