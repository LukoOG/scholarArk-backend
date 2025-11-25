import { Injectable } from '@nestjs/common';
import { GenerateQuestionsDto } from 'src/assessments/dto/generate-questions.dto';
import { GoogleGenAI } from '@google/genai';
import type { GenerateContentResponse } from "@google/genai";
import { retryRequest } from "../utils"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

@Injectable()
export class AiService {
	private model: GoogleGenAI
	
	constructor(){
		this.model = new GoogleGenAI({apiKey: GEMINI_API_KEY});
	};
  async generateQuestions(dto: GenerateQuestionsDto) {
    const { prompt, count = 5, difficulty, questionType } = dto;

    const chat = await this.model.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `
      Generate ${count} ${questionType ?? "mixed"} questions.
      Difficulty: ${difficulty ?? "medium"}
      Prompt: ${prompt}
      Format: JSON
	  
	  
	  make sure the output follows this dto structure
	  class OptionDto {
  @IsString() id: string;
  @IsString() text: string;
}

class QuestionDto {
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
      `,
    });
	
	const response = chat.text

    return response
  }
}
