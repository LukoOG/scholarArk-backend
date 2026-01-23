import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>

export enum QuestionType {
  MCQ = 'mcq',
  TF = 'true_false',
  NUMERIC = 'numeric',
}

export enum QuestionDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

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

  @Prop({ enum: QuestionDifficulty, index: true })
  difficulty: QuestionDifficulty;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

export class QuestionSnapshot {
  questionId: Types.ObjectId;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
}
