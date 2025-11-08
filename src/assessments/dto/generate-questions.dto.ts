import { IsString, IsOptional, IsNumber } from 'class-validator';

export class GenerateQuestionsDto {
  @IsString()
  prompt: string; // user-facing prompt for AI
  @IsOptional() @IsNumber() count?: number; // number of Qs
  @IsOptional() @IsString() difficulty?: string;
  @IsOptional() @IsString() questionType?: 'mcq' | 'true_false' | 'numeric' | 'mixed';
}
