import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CourseModule, CourseModuleDocument } from '../schemas/module.schema';
import { Types, Model, Connection } from 'mongoose';
import { CreateModuleDto } from '../dto/modules/create-module.dto';
import { Course, CourseDocument } from '../schemas/course.schema';
import { Lesson, LessonDocument } from '../schemas/lesson.schema';

@Injectable()
export class ModulesService {
    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(CourseModule.name) private moduleModel: Model<CourseModuleDocument>,
        @InjectModel(Lesson.name) private readonly lessonModel: Model<LessonDocument>,
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async addModule(courseId: Types.ObjectId, tutorId: Types.ObjectId, dto: CreateModuleDto) {
        const session = await this.connection.startSession();
        session.startTransaction()

        try {
            const course = await this.courseModel.findOne(
                { _id: courseId, tutor: tutorId },
                null,
                { session }
            )
                .lean()
                .exec();

            if (!course) throw new BadRequestException("Course not found");

            if (course.isPublished) throw new BadRequestException("Cannot edit published course");

            const lastModule = await this.moduleModel.findOne({ course: courseId })
                .sort({ position: -1 })
                .select('position')
                .lean()
                .exec();

            const nextPostion = lastModule ? lastModule.position + 1 : 1;

            const module = await this.moduleModel.create([{
                course: courseId,
                title: dto.title,
                description: dto.description,
                position: nextPostion,
                // isPublished: false,
            }], { session })

            const moduleId = module[0]._id;

            if (dto?.lessons.length > 0) {
                const lessonsToInsert = dto.lessons.map((lesson, index) => ({
                    ...lesson,
                    course: courseId,
                    module: moduleId,
                    position: index + 1,
                }));

                await this.lessonModel.insertMany(lessonsToInsert, { session })
            }

            await session.commitTransaction();
            session.endSession();

            return { moduleId }
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}