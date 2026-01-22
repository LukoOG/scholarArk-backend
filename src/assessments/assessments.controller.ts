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
import { PublishAssessmentDto } from './dto/publish-assessment.dto';

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
  async updateAssessment(@Param('assessmentId') id: Types.ObjectId, @Body() updateAssessmentDto: UpdateAssessmentDto, @GetUser('id') tutorId: Types.ObjectId) {
    const result = await this.assessmentsService.update(id, updateAssessmentDto, tutorId);
    return ResponseHelper.success(result, 200);
  }

  @UseGuards(AssessmentOwnerGuard)
  @Patch(':assessmentId/publish')
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: 'Publish assessment (tutor)' })
  async publish(@Param('assessmentId') assessmentId: Types.ObjectId, @GetUser('id') tutorId: Types.ObjectId, @Body() dto: PublishAssessmentDto) {
    const result = await this.assessmentsService.setPublishState(assessmentId, tutorId, dto.publish);
    return ResponseHelper.success(result)
  }

  @Get('lessons/:lessonId')
  async getAssessmentByLesson(@Param('lessonId') lessonId: Types.ObjectId, @GetUser('id') tutorId: Types.ObjectId){
    const assessment = await this.assessmentsService.getByLesson(lessonId, tutorId)

    return ResponseHelper.success(assessment)
  }
}
