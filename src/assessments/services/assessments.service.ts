import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AiService } from '../../common/services/AI.service';
import { Model, Types } from 'mongoose';
import { Assessment, AssessmentDocument } from '../schemas/assessments.schema';
import { Attempt, AttemptDocument } from '../schemas/attempt.schema';
import { Question } from '../schemas/question.schema';
import { CreateAssessmentDto } from '../dto/assessments/create-assessment.dto';
import { UpdateAssessmentDto } from '../dto/assessments/update-assessment.dto'
import { AddQuestionsDto } from '../dto/question-bank/add-questions.dto';
import { UpdateQuestionsDto } from '../dto/question-bank/update-questions.dto';
import { GenerateQuestionsDto } from '../dto/question-bank/generate-questions.dto';
import { SubmitAttemptDto } from '../dto/attempts/attempt.dto';
import { LessonsService } from 'src/courses/services/lessons.service';
import { LessonType } from 'src/courses/schemas/lesson.schema';
import { PublishAssessmentDto } from '../dto/assessments/publish-assessment.dto';

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

	async getAssessmentById(assessmentId: string) {
		const assessment = await this.assessmentModel.findById(assessmentId).exec();
		if (!assessment) throw new NotFoundException('Assessment not found');
		return assessment;
	}

	async getByLesson(lessonId: Types.ObjectId, tutorId: Types.ObjectId) {
		const lesson = await this.lessonsService.getLessonForAssessment(lessonId);

		if (!lesson) throw new NotFoundException("Lesson for assessment not found");

		if (lesson.type !== LessonType.QUIZ)
			throw new BadRequestException('Lesson is not a quiz');

		if (lesson.course.tutor.toString() !== tutorId.toString())
			throw new ForbiddenException('You do not own this course');

		const assessment = await this.assessmentModel
			.findOne({ lesson: lessonId })
			.exec();

		if (!assessment)
			throw new NotFoundException('Assessment not found for this lesson');

		return assessment;
	}

	async setPublishState(
		assessmentId: Types.ObjectId,
		tutorId: Types.ObjectId,
		publish: boolean,
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

		if (publish) {
			if (assessment.isPublished)
				throw new BadRequestException('Assessment already published');

			// Minimal v1 validation
			if (assessment.totalQuestions <= 0)
				throw new BadRequestException('Invalid assessment configuration');

			assessment.isPublished = true;
			assessment.createdAt = new Date();
		} else {
			if (!assessment.isPublished)
				throw new BadRequestException('Assessment is not published');

			assessment.isPublished = false;
			assessment.createdAt = null;
		}

		await assessment.save();

		return {
			message: publish
				? 'Assessment published successfully'
				: 'Assessment unpublished successfully',
		};
	}

}