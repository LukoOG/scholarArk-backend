import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseCategory, CourseDifficulty } from '../schemas/course.schema';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Lesson title',
    example: 'Introduction to JavaScript',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Lesson content type',
    enum: ['video', 'article', 'quiz'],
    example: 'video',
  })
  @IsEnum(['video', 'article', 'quiz'])
  type: 'video' | 'article' | 'quiz';

  @ApiPropertyOptional({
    description: 'Text content for article or quiz lessons',
    example: 'JavaScript is a programming language...',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Lesson duration in seconds',
    example: 420,
  })
  @IsNumber()
  duration: number;

  @ApiPropertyOptional({
    description: 'Whether this lesson can be previewed before enrollment',
    example: true,
  })
  @IsOptional()
  isPreview?: boolean;
}


export class CreateModuleDto {
  @ApiProperty({
    description: 'Module title',
    example: 'JavaScript Basics',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Optional module description',
    example: 'Covers the fundamentals of JavaScript',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Lessons under this module',
    type: [CreateLessonDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons: CreateLessonDto[];
}

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Complete JavaScript Mastery',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Learn JavaScript from beginner to advanced',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Course category',
    enum: CourseCategory,
    example: CourseCategory.PROGRAMMING,
  })
  @IsEnum(CourseCategory)
  category: CourseCategory;

  @ApiPropertyOptional({
    description: 'Course difficulty level',
    enum: CourseDifficulty,
    example: CourseDifficulty.BEGINNER,
  })
  @IsOptional()
  @IsEnum(CourseDifficulty)
  difficulty?: CourseDifficulty;

  @ApiProperty({
    description: 'Course price',
    example: 15000,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Modules included in the course',
    type: [CreateModuleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  modules: CreateModuleDto[];
}