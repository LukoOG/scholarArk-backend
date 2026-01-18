import { Controller, Post, Get, Patch, Body, Delete, Param, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { Types } from "mongoose";
import { Request } from "express";
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { UpdateQuestionsDto } from './dto/update-questions.dto';
import { AddQuestionsDto } from './dto/add-questions.dto';
import { SubmitAttemptDto } from './dto/attempt.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Roles, GetUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { AssessmentOwnerGuard } from './assessments.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UserRole } from '../common/enums';
import { ResponseHelper } from '../common/helpers/api-response.helper';

@ApiTags('assessments')
@Controller('assessments')
@UseGuards(AuthGuard, RolesGuard)
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) { }

  @Post()
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: 'Create a new assessment (tutor)' })
  @ApiResponse({ status: 201, description: 'Assessment created successfully' })
  async create(@Body() createAssessmentDto: CreateAssessmentDto, @GetUser('id') tutorId: Types.ObjectId) {
    const result = await this.assessmentsService.createAssessment(createAssessmentDto, tutorId);
    return ResponseHelper.success(result, HttpStatus.CREATED);
  }

  @UseGuards(AssessmentOwnerGuard)
  @Patch(':assessmentId')
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: "Edit assessment (tutor)" })
  async updateAssessment(@Param('id') id: string, @Body() updateAssessmentDto: UpdateAssessmentDto) {
    const result = await this.assessmentsService.updateAssessmentById(id, updateAssessmentDto);
    return ResponseHelper.success(result, 200);
  }

  @UseGuards(AssessmentOwnerGuard)
  @Post(':assessmentId/questions')
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: 'Add questions to an assessment (tutor)' })
  async addQuestions(
    @Param('assessmentId') id: string,
    @Body() addQuestionsDto: AddQuestionsDto,
  ) {
    const result = await this.assessmentsService.addQuestions(id, addQuestionsDto);
    return ResponseHelper.success(result, 200);
  }

  @UseGuards(AssessmentOwnerGuard)
  @Patch(':assessmentId/questions')
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: "Update assessment's questions (tutor)" })
  async updateAssessmentQuestions(@Param('assessmentId') id: string, @Body() updateQuestionsDto: UpdateQuestionsDto) {
    const result = await this.assessmentsService.updateQuestions(id, updateQuestionsDto);
    return ResponseHelper.success(result, 200);
  }

  @UseGuards(AssessmentOwnerGuard)
  @Post(':assessmentId/generate-questions')
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: "Generate questions using AI" })
  async generateQuestions(@Param('assessmentId') id: string, @Body() dto: GenerateQuestionsDto) {
    const result = await this.assessmentsService.generateQuestions(id, dto)
    return ResponseHelper.success(result, 200);
  }


  @UseGuards(AssessmentOwnerGuard)
  @Post(':assessmentId/publish')
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: 'Publish assessment (tutor)' })
  async publish(@Param('assessmentId') id: string) {
    return this.assessmentsService.publishAssessment(id);
  }

  @Get(':assessmentId')
  @Roles(UserRole.TUTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get assessment by ID (students/tutors)' })
  async getAssessment(@Param('assessmentId') id: string) {
    const result = await this.assessmentsService.getAssessmentById(id);
    return ResponseHelper.success(result, 200);
  }

  @Delete(':assessmentId')
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: 'Delete a batch of questions (tutors)' })
  async deleteAssessmentQuestions(@Param('assessmentId') id: string, @Body() ids: string[]) {
    const result = await this.assessmentsService.softDeleteQuestions(id, ids);
    return ResponseHelper.success(result, HttpStatus.OK);
  }
  ///Student related endpoints
  @Post(':idassessmentId/start')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Start an attempt (students)" })
  @ApiResponse({
    status: 201,
    description: 'Attempt started successfully',
    schema: {
      example: {
        data: {
          attemptId: '634f8c8d04658efd97add443',
          assessmentId: '634f8c8d04658efd97add440',
          startedAt: '2025-12-08T12:00:00.000Z',
        },
        statusCode: 201,
        error: null,
      },
    },
  })
  async startAttempt(@Param('assessmentId') assessmentId: string, @GetUser('id') studentId: string) {
    const result = await this.assessmentsService.startAttempt(assessmentId, studentId)
    return ResponseHelper.success(result, HttpStatus.CREATED)
  }

  @Patch(":assessmentId")
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: "Patch an attempt (autosave answers from local state)",
  })
  @ApiResponse({
    status: 200,
    description: 'Attempt updated successfully',
    schema: {
      example: {
        data: { message: 'Progress saved' },
        statusCode: 200,
        error: null,
      },
    },
  })
  async editAttempt(@Param('assessmentId') attemptId: string, @GetUser('id') studentId: string, @Body() submitAttemptDto: SubmitAttemptDto) {
    const result = await this.assessmentsService.editAttempt(attemptId, studentId, submitAttemptDto);
    return ResponseHelper.success(result, 200)
  }

  @Post(':assessmentId/submit')
  @Roles()
  @ApiOperation({ summary: "Submit answers for an attempt (student)" })
  @ApiResponse({
    status: 200,
    description: 'Attempt submitted and scored',
    schema: {
      example: {
        data: { score: 4 },
        statusCode: 200,
        error: null,
      },
    },
  })
  async submitAttempt(@Param('assessmentId') assessmentId: string, @GetUser('id') studentId: string, @Body() submitAttemptDto: SubmitAttemptDto) {
    const result = await this.assessmentsService.submitAttempt(assessmentId, studentId, submitAttemptDto)
    return ResponseHelper.success(result, 200)
  };
  //Add get attempt state endpoint to restore state on FE/mobile in cases of disconnection
}
