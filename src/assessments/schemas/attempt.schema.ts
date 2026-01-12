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
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true })
  assessment: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop()
  submittedAt?: Date;

  @Prop({ default: 0})
  attemptNumber: number;

  @Prop({ enum: AttemptStatus, default: AttemptStatus.IN_PROGRESS })
  status: AttemptStatus

  @Prop()
  score?: number;

  @Prop({ type: Map, of: mongoose.Schema.Types.Mixed })
  answers: Record<string, any>;
}
export const AttemptSchema = SchemaFactory.createForClass(Attempt);
