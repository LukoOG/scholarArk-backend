import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  course: Types.ObjectId;

  @Prop({
    enum: ['pending', 'active', 'completed', 'cancelled', 'refunded'],
    default: 'active',
  })
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'refunded';

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Payment', required: false })
  payment?: Types.ObjectId;

  @Prop({ default: Date.now })
  enrolledAt: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
