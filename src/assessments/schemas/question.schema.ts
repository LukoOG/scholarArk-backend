import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { QuestionType } from './assessment.schema';

@Schema({ _id: true }) 
export class Question {
  @Prop({ required: true, enum: QuestionType })
  type: QuestionType;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [Object], required: false })
  options?: { id: string; text: string }[];

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ default: 1 })
  points?: number;
  
  @Prop({ default: false })
  isDeleted: boolean
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
