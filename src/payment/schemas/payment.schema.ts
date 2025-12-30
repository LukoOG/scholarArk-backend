import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as Mschema, Types } from "mongoose";
import { UserDocument } from "src/user/schemas/user.schema";

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentStatus {
    INITIALIZED = "initialized",
    FAILED = "failed",
    SUCCESS = "success"
}


@Schema({ timestamps: true })
export class Payment {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    user: Types.ObjectId;
	
    @Prop({ type: Types.ObjectId, ref: "Course", required: true })
    course: Types.ObjectId;

    @Prop({ type: Number, required: true, min: 1, immutable: true })
	amount: number;

	@Prop({ required: true })
	currency: string; // "NGN"

	@Prop({
		enum: ['paystack'],
		default: 'paystack',
	})
	provider: 'paystack';

    @Prop({ type: Number, immutable: true })
    transactionId: number;

  @Prop({ required: true })
  reference: string;

  @Prop({
    enum: PaymentStatus,
    default: PaymentStatus.INITIALIZED,
  })
  status: PaymentStatus;
}


export const PaymentSchema = SchemaFactory.createForClass(Payment)