import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../../config'
import { GenerateQuestionsDto } from 'src/assessments/dto/question-bank/generate-questions.dto';
import { GoogleGenAI } from '@google/genai';
import type { GenerateContentResponse } from "@google/genai";
import { retryRequest } from "../utils"
import { QuestionDifficulty, QuestionType } from 'src/assessments/schemas/question.schema';

@Injectable()
export class AiService {
  private model: GoogleGenAI;

  constructor(private readonly configService: ConfigService<Config, true>) {

    this.model = new GoogleGenAI({ apiKey: this.configService.get('gemini', { infer: true }) });
  }

  async generateQuestions(dto: GenerateQuestionsDto) {
    const { prompt, count = 5, difficulty = QuestionDifficulty.EASY, questionType = QuestionType.MCQ } = dto;

    const response = await this.model.models.generateContent({
      model: 'gemini-2.0-flash',
      config: {
        responseMimeType: 'application/json',
      },
      contents: `
          You are generating questions for an online learning platform.

          STRICT RULES:
          - Output MUST be valid JSON
          - correctAnswer MUST exist inside options
          - options MUST have at least 4 items
          - No markdown
          - No explanations

          Generate ${count} ${questionType} questions.
          Difficulty: ${difficulty}
          Context: ${prompt}

          JSON FORMAT:
          {
            "questions": [
              {
                "type": "mcq",
                "text": "Question text",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": "A",
                "difficulty": "${difficulty}",
                "points": 1
              }
            ]
          }
          `,
    });

    return response.text;
  }
}

