import { AttachedEnhancerDefinition } from '@nestjs/core/inspector/interfaces/extras.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type AttemptDocument = HydratedDocument<Attempt>;

export enum AttemptStatus {
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  IN_PROGRESS = 'in_progress'
}

@Schema({ timestamps: true })
export class Attempt {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Assessment', required: true })
  assessment: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  @Prop({
    type: [{ question: { type: Types.ObjectId, ref: 'Question' }, options: [String], }],
  })
  questions: {
    question: Types.ObjectId;
    options: string[];
  }[];

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop()
  submittedAt?: Date;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  score?: number;
}
export const AttemptSchema = SchemaFactory.createForClass(Attempt);
