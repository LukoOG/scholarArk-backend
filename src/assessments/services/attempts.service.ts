import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Attempt, AttemptDocument } from '../schemas/attempt.schema';
import { Assessment, AssessmentDocument } from '../schemas/assessments.schema';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';

@Injectable()
export class AttemptsService {
    constructor(
        @InjectModel(Assessment.name) private readonly assessmentModel: Model<AssessmentDocument>,
        @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
        @InjectModel(Attempt.name) private readonly attemptModel: Model<AttemptDocument>,
    ) { }

    async startAttempt(assessmentId: Types.ObjectId, studentId: Types.ObjectId) {
        const assessment = await this.assessmentModel.findById(assessmentId);
        if (!assessment || !assessment.isPublished) {
            throw new BadRequestException('Assessment not available');
        }

        const existing = await this.attemptModel.findOne({
            assessment: assessmentId,
            student: studentId,
            submittedAt: null,
        });

        if (existing) return existing;

        const questions = await this.questionModel.aggregate([
            { $match: { assessment: assessment._id, isDeleted: false } },
            { $sample: { size: assessment.totalQuestions } },
        ]);

        const snapshot = questions.map((q) => ({
            questionId: q._id,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
        }));

        const attempt = await this.attemptModel.create({
            assessment: assessmentId,
            student: studentId,
            questionsSnapshot: snapshot,
            maxScore: snapshot.reduce((a, q) => a + q.points, 0),
        });

        return {
            attemptId: attempt._id,
            questions: snapshot.map(({ correctAnswer, ...q }) => q),
            startedAt: attempt.startedAt,
        };
    }
}