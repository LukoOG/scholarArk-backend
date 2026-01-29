import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { CourseModule } from './module.schema';
import { PaymentCurrency } from 'src/payment/schemas/payment.schema';

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
  SCIENCE = 'science',
  ARTS = 'arts',
  COMMERCE = 'commerce',
  TECHNOLOGY = 'technology',
  PROGRAMMING = 'programming',
  HEALTH = 'health',
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

  // @Prop({ unique: true, index: true })
  // slug: string;

  @Prop({ type: String, enum: CourseCategory, required: true })
  category: CourseCategory;

  @Prop({ type: String, enum: CourseDifficulty, default: CourseDifficulty.BEGINNER })
  difficulty: CourseDifficulty;

  // @Prop({ default: 0 })
  // price: number;
  @Prop({ type: Map, of: Number, required: true })
  prices: Map<PaymentCurrency, number>

  @Prop({ default: 0 })
  studentsEnrolled: number;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalDuration: number; // seconds

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  publishedAt?: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ category: 1, difficulty: 1 });
