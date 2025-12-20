import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from "../../user/schemas/user.schema";

export type CourseDocument = HydratedDocument<Course>;

export enum CourseCategory {
  SCIENCE = 'science',
  ARTS = 'arts',
  COMMERCE = 'commerce',
  TECHNOLOGY = 'technology',
  HEALTH = 'health',
}

@Schema({ timestamps: true })
export class Course {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	tutor: Types.ObjectId;
	
	@Prop()
	title: string;
	
	@Prop()
	description: string;
	
	@Prop({ type: String, enum: CourseCategory, required: true })
	category: CourseCategory;
	
	@Prop()
	resource?: string;
	
	@Prop({ enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' })
	difficulty?: string;
	
	@Prop({ default: 0 })
	price: number;
	
	@Prop({ default: 0 })
	students_enrolled: number;
	
	@Prop()
	thumbnail_url: string;
	
	@Prop({ default: 0 })
	rating: number;
	
	/* TODO: define tags enum
	@Prop()
	tags
	*/
	
	@Prop()
	isPublished: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
