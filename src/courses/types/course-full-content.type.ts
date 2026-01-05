import { Types } from 'mongoose';

export interface LessonContent {
  videoUrl?: string;
  duration?: number;
  text?: string;
}

export interface LessonFullContent {
  _id: Types.ObjectId;
  title: string;
  order: number;
  type: 'video' | 'text' | 'quiz';
  content: LessonContent;
}

export interface ModuleFullContent {
  _id: Types.ObjectId;
  title: string;
  order: number;
  lessons: LessonFullContent[];
}

export interface TutorPreview {
  _id: Types.ObjectId;
  name: string;
}

export interface CourseFullContent {
  _id: Types.ObjectId;
  title: string;
  description: string;
  tutor: TutorPreview;
  modules: ModuleFullContent[];
}