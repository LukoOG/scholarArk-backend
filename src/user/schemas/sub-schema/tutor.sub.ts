import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";

export enum TutorVerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ _id: false })
export class TutorProfile {
  @Prop({
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  })
  rating: number;

  @Prop({
    type: Number,
    default: 0,
  })
  totalReviews: number;

  @Prop({
    type: String,
    trim: true,
  })
  highestQualification?: string;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  yearsOfExperience: number;
}

@Schema({ _id: false })
export class TutorVerification {
  @Prop({
    type: String,
    enum: TutorVerificationStatus,
    default: TutorVerificationStatus.PENDING,
  })
  status: TutorVerificationStatus;

  @Prop({ type: Date })
  verifiedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;

  @Prop({ type: String, trim: true })
  rejectionReason?: string;
}