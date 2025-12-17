import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../../config'
import { GenerateQuestionsDto } from 'src/assessments/dto/generate-questions.dto';
import { GoogleGenAI } from '@google/genai';
import type { GenerateContentResponse } from "@google/genai";
import { retryRequest } from "../utils"

@Injectable()
export class AiService {
  private model: GoogleGenAI;

  constructor(private readonly configService: ConfigService<Config, true>) {
	
    this.model = new GoogleGenAI({ apiKey: configService.get('gemini', { infer: true }) });
  }

  async generateQuestions(dto: GenerateQuestionsDto) {
    const { prompt, count = 5, difficulty, questionType } = dto;

    const chat = await this.model.models.generateContent({
      model: 'gemini-2.0-flash',
	  config:{
		responseMimeType: "application/json",  
	  },
      contents: `
        Generate ${count} ${questionType ?? "mixed"} questions.
        Difficulty: ${difficulty ?? "medium"}.
        Prompt: ${prompt}

        Format: JSON following this structure:
        {
          "questions": [
            {
              "type": "...",
              "question": "...",
              "options": [...],
              "correctAnswer": "...",
              "points": 1
            }
          ]
        }
      `,
    });

    return chat.text;
  }
}

