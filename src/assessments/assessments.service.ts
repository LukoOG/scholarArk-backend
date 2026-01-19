import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
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
import { LessonsService } from 'src/courses/services/lessons.service';
import { LessonType } from 'src/courses/schemas/lesson.schema';

@Injectable()
export class AssessmentsService {

	constructor(
		@InjectModel(Assessment.name)
		private readonly assessmentModel: Model<AssessmentDocument>,
		@InjectModel(Attempt.name)
		private readonly attemptModel: Model<AttemptDocument>,
		private readonly aiService: AiService,
		private readonly lessonsService: LessonsService,
	) { }

	private calculateScore(snapshot: any[], answers: { questionId: string; answer: string; }[]) {
		let score = 0;

		for (let i = 0; i < snapshot.length; i++) {
			if (answers[i].answer === snapshot[i].correctAnswer) {
				score++;
			}
		}

		return score;
	}

	private async validatePublishable(assessment: Assessment): Promise<void> {
		if (!assessment.title) throw new BadRequestException("Assessment must have a title");

		if (!assessment.lesson) throw new BadRequestException("Assessment must be associated with a Course Lesson");

		if (!assessment.isPublished) throw new BadRequestException("Assessment must be published");

		if (assessment.totalQuestions === 0) throw new BadRequestException("Assessment must define at least 1 question");
	}

	async createAssessment(dto: CreateAssessmentDto, tutorId: Types.ObjectId) {
		const lesson = await this.lessonsService.getLessonForAssessment(dto.lessonId);

		if (!lesson) throw new NotFoundException('Lesson not found');

		if (lesson.type !== LessonType.QUIZ) throw new BadRequestException('Lesson is not a quiz');

		if (lesson.course.tutor.toString() !== tutorId.toString()) {
			throw new BadRequestException('You are not the owner of this course');
		}

		const existing = await this.assessmentModel.findOne({
			lesson: dto.lessonId,
		});

		if (existing) throw new ConflictException('Assessment already exists for this lesson');

		const total =
			dto.distribution.easy +
			dto.distribution.medium +
			dto.distribution.hard;

		if (total !== dto.totalQuestions)
			throw new BadRequestException(
				'Distribution does not match totalQuestions',
			);

		return this.assessmentModel.create({
			lesson: dto.lessonId,
			title: dto.title,
			totalQuestions: dto.totalQuestions,
			distribution: dto.distribution,
			durationMinutes: dto.durationMinutes,
			createdBy: tutorId,
			isPublished: false,
		});
	}
	async update(
		assessmentId: Types.ObjectId,
		dto: UpdateAssessmentDto,
		tutorId: Types.ObjectId,
	) {
		const assessment = await this.assessmentModel
			.findById(assessmentId)
			.populate({
				path: 'lesson',
				populate: {
					path: 'course',
					select: 'tutor',
				},
			})
			.exec();

		if (!assessment) throw new NotFoundException('Assessment not found');

		if (assessment.createdBy.toString() !== tutorId.toString())
			throw new ForbiddenException('You do not own this assessment');

		if (assessment.isPublished)
			throw new BadRequestException('Cannot update a published assessment');

		if (dto.distribution && dto.totalQuestions) {
			const total =
				dto.distribution.easy +
				dto.distribution.medium +
				dto.distribution.hard;

			if (total !== dto.totalQuestions)
				throw new BadRequestException(
					'Distribution does not match totalQuestions',
				);
		}

		Object.assign(assessment, dto);
		await assessment.save();

		return assessment;
	}


	// async addQuestions(assessmentId: string, addQuestionsDto: AddQuestionsDto) {
	// 	const assessment = await this.assessmentModel.findById(assessmentId).exec()
	// 	if (!assessment) throw new NotFoundException('Assessment not found')

	// 	addQuestionsDto.questions.map((question) => { const q = { ...question, isDeleted: false }; return q })
	// 		.forEach((question) => assessment.questions.push(question))

	// 	await assessment.save()

	// 	return assessment;
	// }

	async publishAssessment(assessmentId: string) {
		const assessment = await this.assessmentModel.findById(assessmentId).exec();
		if (!assessment) throw new NotFoundException('Assessment not found');

		await this.validatePublishable(assessment);

		assessment.isPublished = true;
		await assessment.save();

		return { message: 'Assessment published successfully' };
	}

	async getAssessmentById(assessmentId: string) {
		const assessment = await this.assessmentModel.findById(assessmentId).exec();
		if (!assessment) throw new NotFoundException('Assessment not found');
		return assessment;
	}

	async updateAssessmentById(assessmentId: string, updateAssessmentDto: UpdateAssessmentDto) {
		const assessment = await this.assessmentModel.findByIdAndUpdate(assessmentId, updateAssessmentDto, { upsert: true }).exec();
		if (!assessment) throw new NotFoundException('Assessment not found');
		return assessment;
	}

	// async generateQuestions(id: string, dto: GenerateQuestionsDto) {
	// 	const assessment = await this.assessmentModel.findById(id).exec();
	// 	if (!assessment) throw new NotFoundException("Assessment not found");

	// 	const aiResponse = await this.aiService.generateQuestions(dto);

	// 	console.log(aiResponse);

	// 	const parsed = JSON.parse(aiResponse);

	// 	assessment.questions.push(...parsed.questions);
	// 	await assessment.save();

	// 	return assessment;
	// }

	// async updateQuestions(assessmentId: string, dto: UpdateQuestionsDto) {
	// 	const assessment = await this.assessmentModel.findById(assessmentId).exec();

	// 	if (!assessment) throw new NotFoundException("Assessment not found");

	// 	const existingQuestions = assessment.questions;

	// 	dto.questions.forEach((incoming) => {
	// 		if (incoming._id) {
	// 			const index = existingQuestions.findIndex((q) => q._id.toString() == incoming._id.toString());
	// 			if (index !== -1) {
	// 				existingQuestions[index] = {
	// 					...existingQuestions[index],
	// 					...incoming
	// 				}
	// 			}
	// 			else { //index not found -> add
	// 				existingQuestions.push({ ...incoming, isDeleted: false })
	// 			}
	// 		} else {
	// 			existingQuestions.push({ ...incoming, isDeleted: false })
	// 		}
	// 	});

	// 	await assessment.save();
	// 	return assessment;
	// }

	// async softDeleteQuestions(assessmentId: string, ids: string[]) {
	// 	const assessment = await this.assessmentModel.findById(assessmentId).exec();
	// 	if (!assessment) throw new NotFoundException("Assessment not found");
	// 	if (!ids || !ids.length) throw new BadRequestException("No question ids provided")

	// 	const questions = assessment.questions;

	// 	let deletedCount = 0;
	// 	assessment.questions.forEach((question) => {
	// 		if (ids.includes(question._id.toString())) {
	// 			question.isDeleted = true
	// 			deletedCount++
	// 		}
	// 	});

	// 	await assessment.save();

	// 	return { message: "Questions deleted", deletedCount }
	// }

	// async startAttempt(assessmentId: string, studentId: string) {
	// 	const assessment = await this.assessmentModel.findById(assessmentId).exec();
	// 	if (!assessment) throw new NotFoundException("Assessment not found");
	// 	if (!assessment.isPublished) throw new BadRequestException("Assessment not available");

	// 	const existing = await this.assessmentModel.findOne({
	// 		assessment_id: assessmentId,
	// 		student_id: studentId,
	// 		submittedAt: null,
	// 	})

	// 	if (existing) return existing;

	// 	const sanitizedQuestions = assessment.questions.map((q) => {
	// 		const { correctAnswer, ...rest } = q;
	// 		return rest
	// 	})

	// 	return this.attemptModel.create({
	// 		student: studentId,
	// 		assessment: assessment._id.toString(),
	// 		startedAt: Date.now(),
	// 		questionsSnapshot: sanitizedQuestions,
	// 		answers: []
	// 	})
	// };

	// async editAttempt(attemptId: string, studentId: string, submitAttemptDto: SubmitAttemptDto) {
	// 	const attempt = await this.attemptModel.findOne({
	// 		id: attemptId,
	// 		student_id: studentId,
	// 		submittedAt: null,
	// 	}).exec();

	// 	if (!attempt) throw new NotFoundException('Active attempt not found');

	// 	submitAttemptDto.answers.forEach((incoming) => {
	// 		const existingIndex = attempt.answers.findIndex(
	// 			(a) => a.questionId === incoming.questionId
	// 		);

	// 		if (existingIndex !== -1) {
	// 			attempt.answers[existingIndex] = incoming;
	// 		} else {
	// 			attempt.answers.push(incoming);
	// 		}
	// 	});

	// 	await attempt.save();

	// 	return { message: 'Progress saved' };
	// }


	// async submitAttempt(assessmentId: string, studentId: string, dto: SubmitAttemptDto) {
	// 	//TODO: check time && other conditions
	// 	const attempt = await this.attemptModel.findOne({
	// 		student: studentId,
	// 		assessment: assessmentId,
	// 	});

	// 	if (!attempt) throw new NotFoundException('Attempt not started');

	// 	attempt.answers = dto.answers;
	// 	attempt.submittedAt = new Date();

	// 	await attempt.save();

	// 	return { message: "Answers submitted successfully" }
	// };
}
