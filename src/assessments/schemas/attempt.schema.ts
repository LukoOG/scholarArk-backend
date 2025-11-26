import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttemptDocument = HydratedDocument<Attempt>;

@Schema({ timestamps: true })
export class Attempt {
  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessment_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student_id: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop()
  submittedAt?: Date;

  @Prop({ type: Array, required: true })
  // snapshot of questions asked (so grading is deterministic)
  questionsSnapshot: any[];

  @Prop({ type: Array, required: true })
  // user's answers (align with snapshot order)
  answers: any[];

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: false })
  graded: boolean;
}
export const AttemptSchema = SchemaFactory.createForClass(Attempt);
