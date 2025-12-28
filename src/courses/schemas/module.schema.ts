@Schema({ timestamps: true })
export class CourseModule {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

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
