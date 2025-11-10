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
	
  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  })
  username: string;
  ///
  @Prop()
  first_name: string;
  
  @Prop()
  last_name: string;
  
  @Prop({ type: Email })
  email: Email;

  @Prop({ type: Phone })
  phone?: Phone;
  
  @Prop({ type: String, enum: Gender })
  gender?: Gender;

  @Prop({ type: Date })
  birthday?: Date;
  
  @Prop({ type: String, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;
  
  @Prop()
  address?: string;
  
  @Prop()
  stars?: number;
  
  @Prop()
  highest_qualification?: string;
  
  @Prop()
  profile_pic: string;
  ///
  @Prop()
  password?: string;

  @Prop({ type: Nonce })
  nonce?: Nonce;

  @Prop({ type: Wallet })
  wallet?: Wallet;

  @Prop({ type: Number, min: 0, default: 0 })
  unreadNotifications?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
