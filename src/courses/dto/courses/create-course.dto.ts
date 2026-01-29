import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseCategory, CourseDifficulty } from '../../schemas/course.schema';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentCurrency } from 'src/payment/schemas/payment.schema';

export class LessonMediaDto {
  @ApiProperty({
    description: 'S3 object key where the media is stored',
    example: 'courses/123/lessons/456/video.mp4',
  })
  @IsString()
  @IsNotEmpty()
  s3key: string;

  @ApiPropertyOptional({
    description: 'If video, duration of the video in seconds',
    example: 420,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 104857600,
  })
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiProperty({
    description: 'Mime type of the uploaded file',
    example: 'video/mp4',
  })
  @IsString()
  mimeType: string;
}


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

  @ApiPropertyOptional({
    description: 'Media information for video lessons',
    type: LessonMediaDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LessonMediaDto)
  media?: LessonMediaDto;
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

class PriceDto {
  @ApiProperty({
    example: PaymentCurrency.NAIRA,
    enum: PaymentCurrency,
    description: "Regional Currency Code"
  })
  @IsNotEmpty()
  @IsString()
  currency: PaymentCurrency

  @ApiProperty({
    example: 15000,
    description: "Price amount in major unit of specified currency"
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number
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

  @ApiPropertyOptional({
    description: 'Thumbnail url returned from S3 bucket upload',
    type: String,
    example: "you know what a url looks like chief🙃"
  })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'List of Course Prices in Supported Currencies',
    type: [PriceDto],
    example: [
      { currency: 'NGN', amount: 15000 },
      { currency: 'USD', amount: 40 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceDto)
  prices: PriceDto[];

  @ApiProperty({
    description: 'Modules included in the course',
    type: [CreateModuleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  modules: CreateModuleDto[];
}