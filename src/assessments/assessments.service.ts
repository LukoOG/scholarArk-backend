import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AiService } from '../common/services/AI.service';
import { Model, Types } from 'mongoose';
import { Assessment, AssessmentDocument } from './schemas/assessments.schema';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { AddQuestionsDto } from './dto/add-questions.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';

@Injectable()
export class AssessmentsService {
	
	constructor(
		@InjectModel(Assessment.name)
		private readonly assessmentModel: Model<AssessmentDocument>,
		private readonly aiservice: AiService,
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
	  const assessment = await this.assessmentModel.findById(assessmentId).exec()
	  if (!assessment) throw new NotFoundException('Assessment not found')
		  
	  addQuestionsDto.questions.forEach((question) => assessment.questions.push(question))
	  
	  await assessment.save()
	  
	  return assessment;
  }

  async publishAssessment(assessmentId: string) {
    const assessment = await this.assessmentModel.findById(assessmentId).exec();
    if (!assessment) throw new NotFoundException('Assessment not found');

    assessment.isPublished = true;
	await assessment.save();
	
    return { message: 'Assessment published successfully', assessment };
  }

  async getAssessmentById(assessmentId: string) {
    const assessment = await this.assessmentModel.findById(assessmentId).exec();
    if (!assessment) throw new NotFoundException('Assessment not found');
    return assessment;
  }
  
  async generateQuestions(assessmentId: string, dto: GenerateQuestionsDto){
	const assessment = await this.assessmentModel.findById(assessmentId).exec();
	if(!assessment) throw new NotFoundException('Assessment not found');
	
	const generatedQuestions = await this.aiservice.generateQuestions(dto);
	
	return { assessmentId, generatedQuestions }	
  }
}
