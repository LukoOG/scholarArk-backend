import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Question, QuestionSchema } from "./question.schema";

export type AssessmentDocument = HydratedDocument<Assessment>;

export enum QuestionType {
  MCQ = 'mcq',
  TF = 'true_false',
  NUMERIC = 'numeric',
}

@Schema({ timestamps: true })
export class Assessment {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop() 
  duration_seconds?: number;

  @Prop() 
  startAt?: Date;

  @Prop() 
  endAt?: Date;

  @Prop({ default: false })
  isPublished: boolean;

  
  @Prop({ type: [QuestionSchema] })
  questions: Question[]; 

  @Prop({ default: 0 })
  maxScore: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}
export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
