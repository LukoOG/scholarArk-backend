import { Prop, Schema } from '@nestjs/mongoose';
import { isEmail } from 'class-validator';

@Schema({ _id: false })
export class Email {
  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: { validator: (v: string) => isEmail(v) },
  })
  value: string;

  @Prop({ type: Boolean, required: true, default: false })
  verified: boolean;

  @Prop({ type: Date })
  verifiedAt?: Date;
}

@Schema({ _id: false })
export class EmailVerification {
  @Prop({ type: String })
  token: string;

  @Prop({ type: Date })
  expiresAt: Date;
}
