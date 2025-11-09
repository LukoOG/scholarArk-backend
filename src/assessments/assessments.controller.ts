import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { AddQuestionsDto } from './dto/add-questions.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('assessments')
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new assessment (tutor)' })
  @ApiResponse({ status: 201, description: 'Assessment created successfully' })
  create(@Body() createAssessmentDto: CreateAssessmentDto) {
    return this.assessmentsService.createAssessment(createAssessmentDto);
  }

  @Post(':id/questions')
  @ApiOperation({ summary: 'Add questions to an assessment (tutor)' })
  addQuestions(
    @Param('id') id: string,
    @Body() addQuestionsDto: AddQuestionsDto,
  ) {
    return this.assessmentsService.addQuestions(id, addQuestionsDto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish assessment (tutor)' })
  publish(@Param('id') id: string) {
    return this.assessmentsService.publishAssessment(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment by ID (students/tutors)' })
  getAssessment(@Param('id') id: string) {
    return this.assessmentsService.getAssessment(id);
  }
}
