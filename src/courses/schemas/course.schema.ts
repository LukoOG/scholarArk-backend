import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { CourseModule } from './module.schema';
import { PaymentCurrency } from 'src/payment/schemas/payment.schema';
import { MediaRef } from 'src/common/schemas/media.schema';

export type CourseDocument = HydratedDocument<Course>;

export interface CourseListItem {
	_id: string;
	title: string;
	thumbnail_url: string;
	price: number;
	rating: number;
	category: CourseCategory;
	difficulty: string;
	students_enrolled: number;
  prices: Map<PaymentCurrency, number>
}

export enum CourseCategory {
  PROGRAMMING = 'programming',
  TECHNOLOGY = 'technology',
  DATA = 'data',
  DESIGN = 'design',
  BUSINESS = 'business',
  STEM = 'stem',
  HEALTH = 'health',
  ARTS = 'arts',
}

export enum CourseDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

@Schema({ timestamps: true })
export class Course {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true })
  tutor: Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: CourseModule.name }],
    default: [],
  })
  modules: Types.ObjectId[]

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: CourseCategory, required: true })
  category: CourseCategory;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], index: true, ref: "Topic" })
  topicsIds: Types.ObjectId[];

  @Prop({ type: String, enum: CourseDifficulty, default: CourseDifficulty.BEGINNER })
  difficulty: CourseDifficulty;

  @Prop({ type: Map, of: Number, required: true })
  prices: Map<PaymentCurrency, number>

  @Prop({ default: 0 })
  studentsEnrolled: number;

  @Prop({ type: MediaRef })
  thumbnailUrl?: MediaRef;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalDuration: number; // seconds

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop()
  publishedAt?: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ topicIds: 1 });
CourseSchema.index({ difficulty: 1 });
CourseSchema.index({ isPublished: 1 });
CourseSchema.index({ title: 'text', description: 'text' });


export const CATEGORY_SUBJECT_MAP: Record<CourseCategory, string[]> = {
  [CourseCategory.PROGRAMMING]: [
    'Programming',
    'Web Development',
    'Mobile Development',
    'Software Engineering',
  ],

  [CourseCategory.TECHNOLOGY]: [
    'Programming',
    'Cloud Computing',
    'DevOps',
    'Cybersecurity',
    'Networking',
  ],

  [CourseCategory.DATA]: [
    'Data Analysis',
    'Data Science',
    'Statistics',
    'Machine Learning',
    'Mathematics',
  ],

  [CourseCategory.DESIGN]: [
    'Graphic Design',
    'UI/UX Design',
    'Illustration',
    'Animation',
    'Drawing',
  ],

  [CourseCategory.BUSINESS]: [
    'Business',
    'Entrepreneurship',
    'Marketing',
    'Finance',
    'Accounting',
    'Economics',
  ],

  [CourseCategory.STEM]: [
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
  ],

  [CourseCategory.HEALTH]: [
    'Health & Wellness',
    'Nutrition',
    'Mental Health',
    'Biology',
  ],

  [CourseCategory.ARTS]: [
    'Drawing',
    'Illustration',
    'Animation',
  ],
};
