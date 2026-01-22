import { IsString, Min, IsInt, IsObject, IsMongoId } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateAssessmentDto {
  @ApiProperty({
    description: 'Lesson ID this assessment belongs to (lesson must be type QUIZ)',
    example: '695bbc7f050dceb9e3202e99',
  })
  @IsMongoId()
  lessonId: Types.ObjectId;

  @ApiProperty({
    example: 'JavaScript Basics Quiz',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Total number of questions per attempt',
    example: 10,
  })
  @IsInt()
  @Min(1)
  totalQuestions: number;

  @ApiProperty({
    description: 'Difficulty distribution',
    example: { easy: 3, medium: 5, hard: 2 },
  })
  @IsObject()
  distribution: {
    easy: number;
    medium: number;
    hard: number;
  };

  @ApiProperty({
    description: 'Time limit in minutes',
    example: 30,
  })
  @IsInt()
  @Min(1)
  durationMinutes: number;
}