export enum LessonType {
  VIDEO = 'video',
  ARTICLE = 'article',
  QUIZ = 'quiz',
}

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourseModule', required: true, index: true })
  moduleId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: String, enum: LessonType, required: true })
  type: LessonType;

  @Prop()
  videoUrl?: string;

  @Prop()
  content?: string; // articles / markdown

  @Prop({ default: 0 })
  duration: number; // seconds

  @Prop({ required: true })
  position: number;

  @Prop({ default: false })
  isPreview: boolean; // FREE lesson

  @Prop({ default: false })
  isPublished: boolean;
}

export type LessonDocument = HydratedDocument<Lesson>;
export const LessonSchema = SchemaFactory.createForClass(Lesson);

LessonSchema.index({ moduleId: 1, position: 1 });
