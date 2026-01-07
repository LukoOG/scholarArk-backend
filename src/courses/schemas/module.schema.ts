import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Lesson } from './lesson.schema';

@Schema({ timestamps: true })
export class CourseModule {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true })
  course: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Lesson.name }],
    default: [],
  })
  lessons: Types.ObjectId[]

  @Prop()
  description?: string;

  @Prop({ required: true })
  position: number; // ordering inside course

  @Prop({ default: 0 })
  totalDuration: number;

  @Prop({ default: false })
  isPublished: boolean;
}

export type CourseModuleDocument = HydratedDocument<CourseModule>;
export const CourseModuleSchema = SchemaFactory.createForClass(CourseModule);

CourseModuleSchema.index({ courseId: 1, position: 1 });
