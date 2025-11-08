import { IsString, IsArray, IsOptional, ValidateNested, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../schemas/assessment.schema';

class OptionDto {
  @IsString() id: string;
  @IsString() text: string;
}

class QuestionDto {
  @IsEnum(QuestionType) type: QuestionType;
  @IsString() text: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OptionDto) options?: OptionDto[]; // MCQ
  @IsOptional() @IsString() correctAnswer?: string; // server-side stored
  @IsOptional() @IsNumber() points?: number;
}

export class AddQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
