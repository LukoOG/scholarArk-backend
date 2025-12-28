import { IsArray, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export class CourseFilterDto {
  @ApiPropertyOptional({
	  example: ['64f17f0f6f0740d2d0bb6be3']
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  topicIds?: string[];

  @ApiPropertyOptional({
	  enum: ['Beginner', 'Intermediate', 'Advanced'],
	  example: 'Beginner',
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({
	  example: 'javascript'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
	  example: ['64f17f0f6f0740d2d0bb6be3']
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  goalIds?: string[];
}
