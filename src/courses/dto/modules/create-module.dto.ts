import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from "class-validator";
import { ParseArray } from "src/common/transforms/parse-array-transform";
import { CreateLessonDto } from "../courses/create-course.dto";

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
  @Transform(ParseArray())
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons: CreateLessonDto[];
}