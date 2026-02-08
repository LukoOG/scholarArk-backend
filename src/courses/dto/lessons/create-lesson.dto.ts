import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, ValidateNested } from "class-validator";

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

  // @ApiPropertyOptional({
  //   description: 'Media key used to associate uploaded file with this lesson (filename)',
  //   example: 'intro-video.mp4',
  // })
  // @IsString()
  // mediaKey?: string;
}
