import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as Mschema, Types } from 'mongoose';
import { UserDocument } from 'src/user/schemas/user.schema';

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentStatus {
  INITIALIZED = 'initialized',
  FAILED = 'failed',
  SUCCESS = 'success',
  REFUND_PENDING = 'refund_pending',
  REFUNDED = 'refunded',
}

export enum RefundStatus {
  NONE = 'none',
  PENDING = 'pending',
  PROCESSING = 'processing',
  PROCESSED = 'processed', // Full refund completed
  FAILED = 'failed',
  REJECTED = 'rejected',
}

export enum PaymentCurrency {
  NAIRA = 'NGN',
  USDOLLARS = 'USD',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0, immutable: true }) //0 for free course
  amount: number;

  @Prop({ enum: PaymentCurrency, required: true })
  currency: PaymentCurrency;

  @Prop({
    enum: ['paystack'],
    default: 'paystack',
  })
  provider: 'paystack';

  @Prop({ type: Object })
  providerPayload?: any;

  @Prop({ type: Number, immutable: true })
  transactionId: number;

  @Prop({ required: true })
  reference: string;

  @Prop({
    enum: PaymentStatus,
    default: PaymentStatus.INITIALIZED,
  })
  status: PaymentStatus;

  @Prop({ type: Date })
  refundRequestedAt?: Date;

  @Prop({ type: String })
  refundReason?: string;

  @Prop({ type: String, enum: RefundStatus, default: RefundStatus.NONE })
  refundStatus: RefundStatus;

  @Prop({ type: String })
  refundTransactionId?: string; // From Paystack
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ reference: 1 }, { unique: true });
