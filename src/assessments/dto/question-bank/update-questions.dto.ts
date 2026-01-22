import { IsString, IsArray, IsOptional, ValidateNested, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './add-questions.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartialType(CreateQuestionDto))
  questions: CreateQuestionDto[];
}
