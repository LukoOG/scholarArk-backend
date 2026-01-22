import { IsString, IsArray, IsOptional, IsInt, IsEnum, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { QuestionDifficulty } from 'src/assessments/schemas/question.schema';
import { QuestionType } from 'src/assessments/schemas/question.schema';
import { ApiProperty } from '@nestjs/swagger';

class OptionDto {
  @IsString() id: string;
  @IsString() text: string;
}

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  @IsString()
  correctAnswer: string;

  @IsEnum(QuestionDifficulty)
  difficulty: QuestionDifficulty;

  @IsOptional()
  @IsInt()
  points?: number;
}


export class AddQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
