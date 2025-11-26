import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Types } from "mongoose";
import { Request } from "express";
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { AddQuestionsDto } from './dto/add-questions.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Roles, GetUser } from '../common/decorators';
import { RolesGuard } from '../common/guards';
import { AssessmentOwnerGuard } from './assessments.guard';
import { UserGuard } from '../user/user.guard';
import { UserRole } from '../common/enums';

@ApiTags('assessments')
@Controller('assessments')
@UseGuards(UserGuard, RolesGuard)
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post()
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: 'Create a new assessment (tutor)' })
  @ApiResponse({ status: 201, description: 'Assessment created successfully' })
  create(@Body() createAssessmentDto: CreateAssessmentDto, @GetUser('id') userId: Types.ObjectId) {
    return this.assessmentsService.createAssessment(createAssessmentDto, userId);
  }

  @UseGuards(AssessmentOwnerGuard)
  @Post(':id/questions')
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: 'Add questions to an assessment (tutor)' })
  addQuestions(
    @Param('id') id: string,
    @Body() addQuestionsDto: AddQuestionsDto,
  ) {
    return this.assessmentsService.addQuestions(id, addQuestionsDto);
  }

  @UseGuards(AssessmentOwnerGuard)
  @Post(':id/publish')
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: 'Publish assessment (tutor)' })
  publish(@Param('id') id: string) {
    return this.assessmentsService.publishAssessment(id);
  }

  @Get(':id')
  @Roles(UserRole.TUTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get assessment by ID (students/tutors)' })
  getAssessment(@Param('id') id: string) {
    return this.assessmentsService.getAssessmentById(id);
  }
  
  @UseGuards(AssessmentOwnerGuard)
  @Post(':id/generate-questions')
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: "Generate questions using AI" })
  genereateQuestions(@Param('id') id: string, @Body() dto: GenerateQuestionsDto){
	return this.assessmentsService.generateQuestions(id, dto)
  }
  
  //Student related endpoints
  @Post(':id/start')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Start an attempt (studens)" })
  startAttempt(@Param('id') assessmentId: string, @GetUser('id') studentId: string){
	return this.assessmentsService.startAttempt(assessmentId, studentId)  
  }
  
  @Post(':id/submit')
  @Roles()
  @ApiOperation({ summary: "Submit answers for an attempt (student)" })
  submitAttempt(@Param('id') assessmentId: string, @GetUser('id') studentId: string, @Body() body: { answers: any[] },){
	return this.assessmentsService.submitAttempt(assessmentId, studentId, body)  
  };
  
}
