import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AiService } from '../common/services/AI.service';
import { Model, Types } from 'mongoose';
import { Assessment, AssessmentDocument } from './schemas/assessments.schema';
import { Attempt, AttemptDocument } from './schemas/attempt.schema';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { AddQuestionsDto } from './dto/add-questions.dto';
import { UpdateQuestionsDto } from './dto/update-questions.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';

@Injectable()
export class AssessmentsService {
	
	constructor(
		@InjectModel(Assessment.name)
		private readonly assessmentModel: Model<AssessmentDocument>,
		@InjectModel(Attempt.name)
		private readonly attemptModel: Model<AttemptDocument>,
		private readonly aiService: AiService,
	){}
	
  async createAssessment(createAssessmentDto: CreateAssessmentDto, id: Types.ObjectId) {
	  const newAssessment = new this.assessmentModel({
		  ...createAssessmentDto,
		  createdBy: id,
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
  
  async updateAssessmentById(assessmentId: string, updateAssessmentDto: UpdateAssessmentDto){
	const assessment = await this.assessmentModel.findByIdAndUpdate(assessmentId,  updateAssessmentDto, { new: true }).exec();
    if (!assessment) throw new NotFoundException('Assessment not found');
    return assessment;
  }
  
  async generateQuestions(id: string, dto: GenerateQuestionsDto) {
		const assessment = await this.assessmentModel.findById(id).exec();
		if (!assessment) throw new NotFoundException("Assessment not found");

		const aiResponse = await this.aiService.generateQuestions(dto);

		console.log(aiResponse);

		const parsed = JSON.parse(aiResponse);

		assessment.questions.push(...parsed.questions);
		await assessment.save();

		return assessment;
	}
	
  async updateQuestions(assessmentId: string, dto: UpdateQuestionsDto){
	  const assessment = await this.assessmentModel.findById(assessmentId).exec();
	  
	  if (!assessment) throw new NotFoundException("Assessment not found");
	  
	  return assessment
  }
	
  async startAttempt(assessmentId: string, studentId: string){
	  const assessment = await this.assessmentModel.findById(assessmentId).exec();
	  if (!assessment) throw new NotFoundException("Assessment not found");
	  if (!assessment.isPublished) throw new BadRequestException("Assessment not available");
	  
	  return this.attemptModel.create({
		student_id: studentId,
		assessment_id: assessment._id.toString(),
		startedAt: new Date(),
		questionsSnapshot: assessment.questions,
		answers: []
	  }) 
  };
  
  async submitAttempt(assessmentId: string, studentId: string, answers: any[]){	  
	  //TODO: check time && other conditions
	  const attempt = await this.attemptModel.findOne({
		student: studentId,
		assessment: assessmentId,
	  });
	  
	  if(!attempt) throw new NotFoundException('Attempt not started');
	  
	  attempt.answers = answers;
	  attempt.submittedAt = new Date();
	  
	  const score = 2//this.calculateScore(attempt.questionsSnapshot, answers)
	  
	  attempt.score = score;
	  
	  await attempt.save();
	  
	  return { score }
  };
}
