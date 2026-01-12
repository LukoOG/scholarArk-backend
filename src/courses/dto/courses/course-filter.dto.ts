import { IsArray, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CourseDifficulty } from '../../schemas/course.schema';

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
  @IsEnum(CourseDifficulty)
  level?: CourseDifficulty;

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

export class CourseQueryDto extends IntersectionType(
  PaginationDto,
  CourseFilterDto,
) {}