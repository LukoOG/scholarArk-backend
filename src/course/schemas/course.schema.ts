import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from "../../user/schemas/user.schema";

export type CourseDocument = HydratedDocument<Course>;


@Schema({ timestamps: true })
export class Course {
	@Prop({ type: Types.ObjectId, ref: User.name })
	user_id: Types.ObjectId;
	
	@Prop()
	title: string;
	
	@Prop()
	description: string;
	
	/* TODO: define difficulty enum
	@Prop()
	difficulty: ;
	*/
	
	@Prop({ required: true, default: 0 })
	price: number;
	
	@Prop({ required: true, default: 0 })
	students_enrolled: number;
	
	@Prop()
	thumbnail_url: string;
	
	@Prop({ required: true, default: 0 })
	rating: number;
	
	/* TODO: define tags enum
	@Prop()
	tags
	*/
	
	@Prop()
	isPublished: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
