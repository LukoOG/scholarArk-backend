import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Question, QuestionSchema } from "./question.schema";

export type AssessmentDocument = HydratedDocument<Assessment>;

export enum QuestionType {
  MCQ = 'mcq',
  TF = 'true_false',
  NUMERIC = 'numeric',
}

@Schema({ timestamps: true })
export class Assessment {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Lesson', required: true })
  lesson: Types.ObjectId;
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: 20})
  totalQuestions: number;

  @Prop({ default: 30 }) 
  duration?: number;

  @Prop({
    type: Map,
    of: Number,
    default: { easy: 3, medium: 5, hard: 2 },
  })
  distribution: Record<'easy' | 'medium' | 'hard', number>;

  // @Prop() 
  // startAt?: Date;

  // @Prop() 
  // endAt?: Date;

  @Prop({ type: Boolean, default: false })
  isPublished: boolean;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
