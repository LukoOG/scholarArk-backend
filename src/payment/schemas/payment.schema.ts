import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as Mschema } from "mongoose";
import { UserDocument } from "src/user/schemas/user.schema";

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentStatus {
    PENDING = " pending",
    FAILED = "failed",
    SUCCESS = "success"
}


@Schema({ timestamps: true })
export class Payment {

    @Prop({ type: Mschema.Types.ObjectId, ref: "User", required: true })
    user: UserDocument

    @Prop({ type: Number, required: true, min: 1, immutable: true })
    amount: number;

    @Prop({ type: Number, immutable: true })
    transactionId: number;

    @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus

}

export const PaymentSchema = SchemaFactory.createForClass(Payment)