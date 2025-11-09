import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assessment, AssessmentDocument } from './schemas/assessment.schema';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { AddQuestionsDto } from './dto/add-questions.dto';

@Injectable()
export class AssessmentsService {
	
	constructor(
		@InjectModel(Assessment.name)
		private readonly assessmentModel: Model<AssessmentDocument>,
	){}
	
  async createAssessment(createAssessmentDto: CreateAssessmentDto) {
	  const newAssessment = new this.assessmentModel({
		  ...createAssessmentDto,
		  isPublished: false,
		  questions: []
	  })
	  
	  return newAssessment.save()
  }

  async addQuestions(assessmentId: string, addQuestionsDto: AddQuestionsDto) {
	  const assessment = this.assessmentModel.findById(assessmentId)
	  if (!assessment) throw new NotFoundException('Assessment not found')
		  
	  addQuestionsDto.forEach((question) => assessment.questions.push(question))
	  
	  await assessment.save()
	  
	  return assessment;
  }

  async publishAssessment(assessmentId: string) {
    const assessment = this.assessments.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Assessment not found');

    assessment.isPublished = true;
	await assessment.save();
	
    return { message: 'Assessment published successfully', assessment };
  }

  async getAssessmentById(assessmentId: string) {
    const assessment = this.assessments.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Assessment not found');
    return assessment;
  }
}
