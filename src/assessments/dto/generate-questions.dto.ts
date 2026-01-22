import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { QuestionType, QuestionDifficulty } from '../schemas/question.schema';

export class GenerateQuestionsDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  count?: number;

  @IsOptional()
  @IsEnum(QuestionDifficulty)
  difficulty?: QuestionDifficulty;

  @IsOptional()
  @IsEnum(QuestionType)
  questionType?: QuestionType;
}
