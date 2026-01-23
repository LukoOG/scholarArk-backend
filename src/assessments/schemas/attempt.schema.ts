import { AttachedEnhancerDefinition } from '@nestjs/core/inspector/interfaces/extras.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { QuestionSnapshot } from './question.schema';

export type AttemptDocument = HydratedDocument<Attempt>;

export enum AttemptStatus {
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  IN_PROGRESS = 'in_progress'
}

export class Answer {
  questionId: Types.ObjectId;
  answer: string;
}

@Schema({ timestamps: true })
export class Attempt {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Assessment', required: true })
  assessment: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  //Randomly selected questions the student sees
  @Prop({
    type: [QuestionSnapshot],
  })
  questionsSnapshot: QuestionSnapshot[];

  //student answers to the questions
  @Prop({ type: [Answer]})
  answers: Answer[];

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop()
  submittedAt?: Date;

  @Prop({ default: false })
  isGraded: boolean;

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  maxScore: number;
}
export const AttemptSchema = SchemaFactory.createForClass(Attempt);
