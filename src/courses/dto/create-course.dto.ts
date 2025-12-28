import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseCategory, CourseDifficulty } from '../schemas/course.schema';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsEnum(['video', 'article', 'quiz'])
  type: 'video' | 'article' | 'quiz';

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsNumber()
  duration: number;

  @IsOptional()
  isPreview?: boolean;
}

export class CreateModuleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons: CreateLessonDto[];
}

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(CourseCategory)
  category: CourseCategory;

  @IsOptional()
  @IsEnum(CourseDifficulty)
  difficulty?: CourseDifficulty;

  @IsNumber()
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  modules: CreateModuleDto[];
}
