import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { QuestionType } from './assessments.schema';

@Schema({ _id: true }) 
export class Question {
  @Prop({ required: true, enum: QuestionType })
  type: QuestionType;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [Object], required: false })
  options?: { id: string; text: string }[];

  @Prop({ required: true })
  correctOptionIndex: number;

  @Prop({ type: [String], index: true })
  tags: string[];

  @Prop({ enum: ['easy' ,'medium' , 'hard'], index: true })
  difficulty: 'easy' | 'medium' | 'hard'
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
