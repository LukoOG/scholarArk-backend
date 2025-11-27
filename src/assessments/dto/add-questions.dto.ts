import { IsString, IsArray, IsOptional, ValidateNested, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../schemas/assessments.schema';
import { ApiProperty } from '@nestjs/swagger';

class OptionDto {
  @IsString() id: string;
  @IsString() text: string;
}

export class QuestionDto {
  @IsEnum(QuestionType) type: QuestionType;
  @ApiProperty({ example: "What is 2 + 2? " }) @IsString() question: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OptionDto) options?: OptionDto[]; // MCQ
  @ApiProperty({ example: "4" })@IsString() correctAnswer: string; // server-side stored
  @IsOptional() @IsNumber() points?: number;
}

export class AddQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
