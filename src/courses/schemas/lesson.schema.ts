import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { LessonMedia } from './lesson-media.schema';

export enum LessonType {
  VIDEO = 'video',
  ARTICLE = 'article',
  QUIZ = 'quiz',
}

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true })
  course: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CourseModule', required: true, index: true })
  module: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: String, enum: LessonType, required: true })
  type: LessonType;

  //For Quiz Type Lessons
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  assessment?: Types.ObjectId;

  @Prop({ type: LessonMedia })
  media?: LessonMedia;
  
  @Prop()
  content?: string;

  @Prop({ required: true })
  position: number;

  @Prop({ default: true }) // default: true for demo
  isPreview: boolean; // FREE lesson

  @Prop({ default: false })
  isPublished: boolean;
}

export type LessonDocument = HydratedDocument<Lesson>;
export const LessonSchema = SchemaFactory.createForClass(Lesson);

LessonSchema.index({ moduleId: 1, position: 1 });
