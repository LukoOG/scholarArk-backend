import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Lesson, LessonDocument, LessonType } from "../schemas/lesson.schema";
import { Model, Types } from "mongoose";

@Injectable()
export class LessonsService {
    constructor(
        @InjectModel(Lesson.name) private readonly lessonModel: Model<LessonDocument>,
    ) { }

    async getLessonForAssessment(lessonId: Types.ObjectId) {
        const lesson = await this.lessonModel
            .findById(lessonId)
            .populate<{ course: { tutor: Types.ObjectId } }>({
                path: 'course',
                select: 'tutor',
            })
            .exec();

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        if (lesson.type !== LessonType.QUIZ) {
            throw new BadRequestException('Lesson is not a quiz');
        }

        return lesson;
    }
}