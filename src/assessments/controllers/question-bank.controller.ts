import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, HttpStatus } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { QuestionsService } from "../services/question-bank.service";
import { Types } from "mongoose";
import { CreateQuestionDto } from "../dto/question-bank/add-questions.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { GetUser } from "src/common/decorators";
import { AssessmentOwnerGuard } from "../assessments.guard";
import { ResponseHelper } from "src/common/helpers/api-response.helper";
import { GenerateQuestionsDto } from "../dto/question-bank/generate-questions.dto";
import { UpdateQuestionsDto } from "../dto/question-bank/update-questions.dto";
import { BulkDeleteQuestionsDto } from "../dto/question-bank/bulk-delete-questions.dto";


@ApiTags("Questions")
@UseGuards(AuthGuard, AssessmentOwnerGuard)
@Controller()
export class QuestionBankController {
    constructor(
        private readonly questionsService: QuestionsService
    ) { }

  @Get('assessments/:assessmentId/questions')
  getByAssessment(@Param('assessmentId') id: string) {
    const result =  this.questionsService.getByAssessment(id);
    return ResponseHelper.success(result)
  }

    @Post('assessments/:assessmentId/questions')
    async create(@Param('assessmentId') assessmentId: Types.ObjectId, @Body() dto: CreateQuestionDto, @GetUser('id') tutorId: Types.ObjectId) {
        const result = await this.questionsService.create(assessmentId, tutorId, dto);
        return ResponseHelper.success(result, HttpStatus.CREATED)
    }

    @Post('assessments/:assessmentId/questions/generate')
    async generate(@Param('assessmentId') assessmentId: Types.ObjectId, @Body() dto: GenerateQuestionsDto, @GetUser('id') tutorId: Types.ObjectId) {
        const result = await this.questionsService.generateFromAI(assessmentId, tutorId, dto);
        return ResponseHelper.success(result)
    }

    @Patch('questions/:assessmentId')
    async update(@Param('assessmentId') assessmentId: Types.ObjectId, @Body() dto: UpdateQuestionsDto) {
        const result = await this.questionsService;
        return ResponseHelper.success(result)
    }

    @Delete('questions')
    delete(@Body() dto: BulkDeleteQuestionsDto) {
        return this.questionsService.softDelete(dto.ids);
    }
}