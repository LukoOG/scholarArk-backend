import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose";
import { Assessment } from "../schemas/assessments.schema";
import { Question } from "../schemas/question.schema";
import { AiService } from "src/common/services/AI.service";
import { CreateQuestionDto } from "../dto/question-bank/add-questions.dto";
import { UpdateQuestionsDto } from "../dto/question-bank/update-questions.dto";
import { GenerateQuestionsDto } from "../dto/question-bank/generate-questions.dto";

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>,
    @InjectModel(Assessment.name)
    private readonly assessmentModel: Model<Assessment>,
    private readonly aiService: AiService,
  ) {}

  async create(
    assessmentId: Types.ObjectId,
    tutorId: Types.ObjectId,
    dto: CreateQuestionDto,
  ) {
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Assessment not found');

    if (!dto.options.includes(dto.correctAnswer)) {
      throw new BadRequestException('Correct answer must be in options');
    }

    return this.questionModel.create({
      ...dto,
      assessment: assessmentId,
      createdBy: tutorId,
    });
  }

  async generateFromAI(
    assessmentId: string,
    tutorId: string,
    dto: GenerateQuestionsDto,
  ) {
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Assessment not found');

    const result: any = await this.aiService.generateQuestions(dto);

    const questions = result.questions.map((q) => ({
      assessment: assessmentId,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      points: q.points ?? 1,
      createdBy: tutorId,
    }));

    return this.questionModel.insertMany(questions);
  }

  async getByAssessment(assessmentId: string) {
    return this.questionModel.find({
      assessment: assessmentId,
      isDeleted: false,
    });
  }

//   async update(id: string, dto: UpdateQuestionsDto) {
//     if (
//       dto.correctAnswer &&
//       dto.options &&
//       !dto.options.includes(dto.correctAnswer)
//     ) {
//       throw new BadRequestException('Correct answer must be in options');
//     }

//     return this.questionModel.findByIdAndUpdate(id, dto, { new: true });
//   }

  async softDelete(ids: string[]) {
    const result = await this.questionModel.updateMany(
      { _id: { $in: ids } },
      { isDeleted: true },
    );

    return { deletedCount: result.modifiedCount };
  }
}
