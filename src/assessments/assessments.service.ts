import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AiService } from '../common/services/AI.service';
import { Model, Types } from 'mongoose';
import { Assessment, AssessmentDocument } from './schemas/assessments.schema';
import { Attempt, AttemptDocument } from './schemas/attempt.schema';
import { Question } from './schemas/question.schema';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { AddQuestionsDto } from './dto/add-questions.dto';
import { UpdateQuestionsDto } from './dto/update-questions.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { SubmitAttemptDto } from './dto/attempt.dto';

@Injectable()
export class AssessmentsService {
	
	constructor(
		@InjectModel(Assessment.name)
		private readonly assessmentModel: Model<AssessmentDocument>,
		@InjectModel(Attempt.name)
		private readonly attemptModel: Model<AttemptDocument>,
		private readonly aiService: AiService,
	){}
	
	private calculateScore(snapshot: any[], answers: { questionId: string; answer: string; }[]) {
	  let score = 0;

	  for (let i = 0; i < snapshot.length; i++) {
		if (answers[i].answer === snapshot[i].correctAnswer) {
		  score++;
		}
	  }

	  return score;
	}
  
  async createAssessment(createAssessmentDto: CreateAssessmentDto, tutorId: Types.ObjectId) {
	  const newAssessment = new this.assessmentModel({
		  ...createAssessmentDto,
		  createdBy: tutorId,
		  startAt: Date.now(),
		  endAt: Date.now(),
		  isPublished: false,
		  questions: []
	  })
	  
	  return newAssessment.save()
  }

  async addQuestions(assessmentId: string, addQuestionsDto: AddQuestionsDto) {
	  const assessment = await this.assessmentModel.findById(assessmentId).exec()
	  if (!assessment) throw new NotFoundException('Assessment not found')
		  
	  addQuestionsDto.questions.map((question)=>{ const q ={...question, isDeleted: false}; return q})
	  .forEach((question) => assessment.questions.push(question))
	  
	  await assessment.save()
	  
	  return assessment;
  }

  async publishAssessment(assessmentId: string) {
    const assessment = await this.assessmentModel.findById(assessmentId).exec();
    if (!assessment) throw new NotFoundException('Assessment not found');

    assessment.isPublished = true;
	await assessment.save();
	
    return { message: 'Assessment published successfully' };
  }

  async getAssessmentById(assessmentId: string) {
    const assessment = await this.assessmentModel.findById(assessmentId).exec();
    if (!assessment) throw new NotFoundException('Assessment not found');
    return assessment;
  }
  
  async updateAssessmentById(assessmentId: string, updateAssessmentDto: UpdateAssessmentDto){
	const assessment = await this.assessmentModel.findByIdAndUpdate(assessmentId,  updateAssessmentDto, { upsert: true }).exec();
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
	  
	  const existingQuestions = assessment.questions;
	  
	  dto.questions.forEach((incoming) => {
		if(incoming._id){
			const index = existingQuestions.findIndex((q) => q._id.toString() == incoming._id.toString());
			if(index !== -1){
				existingQuestions[index] = {
					...existingQuestions[index],
					...incoming
				}
			}
			else { //index not found -> add
				existingQuestions.push({ ...incoming, isDeleted: false })
			}
		} else{
			existingQuestions.push({ ...incoming, isDeleted: false })
		}
	  });
	  
	  await assessment.save();
	  return assessment;
  }
  
  async softDeleteQuestions(assessmentId: string, ids: string[]){
	  const assessment = await this.assessmentModel.findById(assessmentId).exec();
	  if (!assessment) throw new NotFoundException("Assessment not found");
	  if(!ids || !ids.length) throw new BadRequestException("No question ids provided")
	  
	  const questions = assessment.questions;
	  
	  let deletedCount = 0;
	  assessment.questions.forEach((question) => {
		if(ids.includes(question._id.toString())){
			question.isDeleted = true
			deletedCount++
		}  
	  });
	  
	  await assessment.save();
	  
	  return { message: "Questions deleted", deletedCount }
  }
	
  async startAttempt(assessmentId: string, studentId: string){
	  const assessment = await this.assessmentModel.findById(assessmentId).exec();
	  if (!assessment) throw new NotFoundException("Assessment not found");
	  if (!assessment.isPublished) throw new BadRequestException("Assessment not available");
	  
	  const existing = await this.assessmentModel.findOne({
		  assessment_id: assessmentId,
		  student_id: studentId,
		  submittedAt: null,
	  })
	  
	  if(existing) return existing;
	  
	  const sanitizedQuestions = assessment.questions.map((q)=>{
		  const { correctAnswer, ...rest } = q;
		  return rest
	  })
	  
	  return this.attemptModel.create({
		student: studentId,
		assessment: assessment._id.toString(),
		startedAt: Date.now(),
		questionsSnapshot: sanitizedQuestions,
		answers: []
	  }) 
  };
  
  async editAttempt(attemptId: string, studentId: string, submitAttemptDto: SubmitAttemptDto) {
	  const attempt = await this.attemptModel.findOne({
		  id: attemptId,
		  student_id: studentId,
		  submittedAt: null,
		}).exec();

	  if (!attempt) throw new NotFoundException('Active attempt not found');

	  submitAttemptDto.answers.forEach((incoming) => {
		const existingIndex = attempt.answers.findIndex(
		  (a) => a.questionId === incoming.questionId
		);

		if (existingIndex !== -1) {
		  attempt.answers[existingIndex] = incoming;
		} else {
		  attempt.answers.push(incoming);
		}
	  });

	  await attempt.save();

	  return { message: 'Progress saved' };
	}

  
  async submitAttempt(assessmentId: string, studentId: string, dto: SubmitAttemptDto){	  
	  //TODO: check time && other conditions
	  const attempt = await this.attemptModel.findOne({
		student: studentId,
		assessment: assessmentId,
	  });
	  
	  if(!attempt) throw new NotFoundException('Attempt not started');
	  
	  attempt.answers = dto.answers;
	  attempt.submittedAt = new Date();
	  
	  await attempt.save();
	  
	  return { message: "Answers submitted successfully" }
  };
}
