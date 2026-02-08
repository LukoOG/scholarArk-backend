import { BadRequestException, Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, Connection, ClientSession } from 'mongoose';
import { Course, CourseDocument, CourseListItem } from '../schemas/course.schema';
import { CourseModule, CourseModuleDocument } from '../schemas/module.schema';
import { Lesson, LessonDocument, LessonType } from '../schemas/lesson.schema';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { CreateCourseDto } from '../dto/courses/create-course.dto';
import { LessonMedia, LessonMediaDocument, LessonMediaStatus } from '../schemas/lesson-media.schema';
import { OnEvent } from '@nestjs/event-emitter';


@Injectable()
export class CoursesDemoService {
    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(CourseModule.name) private moduleModel: Model<CourseModuleDocument>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
        @InjectConnection() private readonly connection: Connection,
    ) { }
    async create(dto: CreateCourseDto, tutorId: Types.ObjectId): Promise<{ courseId: Types.ObjectId, lessons: { id: Types.ObjectId, key: string }[] }> {
        const session: ClientSession = await this.connection.startSession();

        session.startTransaction();

        const coursePrices = new Map<string, number>();
        dto.prices.map((price) => coursePrices.set(price.currency, price.amount))
        try {
            const course = await this.courseModel.create(
                [
                    {
                        tutor: tutorId,
                        title: dto.title,
                        description: dto.description,
                        category: dto.category,
                        difficulty: dto.difficulty,
                        prices: coursePrices,
                        thumbnailUrl: dto.thumbnail,
                        isPublished: false,
                    }
                ],
                { session },
            );

            const courseId = course[0]._id;
            const lessons = [];
            let totalCourseDuration = 0;

            for (let i = 0; i < dto.modules.length; i++) {
                const mod = dto.modules[i]

                const module = await this.moduleModel.create([
                    {
                        course: courseId,
                        title: mod.title,
                        description: mod.description,
                        position: i + 1,
                    },
                ],
                    { session }
                )

                await this.courseModel.updateOne(
                    { _id: courseId },
                    { $push: { modules: module[0]._id } },
                    { session }
                );

                let moduleDuration = 0;

                for (let j = 0; j < mod.lessons.length; j++) {
                    const modLesson = mod.lessons[j];

                    const lesson = await this.lessonModel.create(
                        [
                            {
                                course: courseId,
                                module: module[0]._id,
                                title: modLesson.title,
                                type: modLesson.type,
                                content: modLesson.content,
                                duration: modLesson.duration,
                                position: j + 1,
                                isPreview: modLesson.isPreview ?? false,
                                media: {
                                    ...modLesson.media,
                                    demo: {
                                        status: LessonMediaStatus.PROCESSING
                                    }
                                }
                            }
                        ],
                        { session },
                    )

                    // lessons.push({ id: lesson[0]._id, key: modLesson.mediaKey })

                    await this.moduleModel.updateOne(
                        { _id: module[0]._id },
                        { $push: { lessons: lesson[0]._id } },
                        { session }
                    )

                    moduleDuration += modLesson.duration;
                };

                await this.moduleModel.updateOne(
                    { _id: module[0]._id },
                    { totalDuration: moduleDuration },
                    { session },
                );

                totalCourseDuration += moduleDuration;
            };

            await this.courseModel.updateOne(
                { _id: courseId },
                { totalDuration: totalCourseDuration },
                { session },
            )

            await session.commitTransaction();
            return { courseId, lessons }
        } catch (error) {
            await session.abortTransaction();
            throw error
        } finally {
            session.endSession();
        };
    }

    async updateLessonMedia(result: { secure_url: string, eager: { secure_url: string }[], public_id: string }, lessonId: Types.ObjectId) {
        await this.lessonModel.updateOne(
            { _id: lessonId },
            {
                'demoMedia.videoUrl': result.secure_url,
                'demoMedia.hlsUrl': result.eager?.[0]?.secure_url,
                'demoMedia.publicId': result.public_id,
                'demoMedia.status': 'ready'
            }
        )
    }

    @OnEvent('lesson.media.uploaded')
    async handleLessonMediaUploaded(payload: {
        lessonId: Types.ObjectId;
        result: any;
    }) {
        console.log('video has been uploaded')
        await this.lessonModel.updateOne(
            { _id: payload.lessonId },
            {
                'media.demo.videoUrl': payload.result.secure_url,
                'media.demo.hlsUrl': payload.result.eager?.[0]?.secure_url,
                'media.demo.publicId': payload.result.public_id,
                'media.demo.status': LessonMediaStatus.UPLOADED,
            }
        );
    }

    @OnEvent('lesson.media.failed')
    async handleLessonMediaFailed({ lessonId }: { lessonId: Types.ObjectId }) {
        await this.lessonModel.updateOne(
            { _id: lessonId },
            { 'media.demo.status': LessonMediaStatus.FAILED }
        );
    }

    async getCloudinaryUrls(lessonId: Types.ObjectId) {
        const lesson = await this.lessonModel.findById(lessonId).select('media').lean().exec();

        if (!lesson || !lesson.media?.demo) {
            throw new NotFoundException('Lesson demo media not found');
        }

        return {
            videoUrl: lesson.media.demo.videoUrl,
            hlsUrl: lesson.media.demo.hlsUrl,
            status: lesson.media.demo.status,
            publicId: lesson.media.demo.publicId,
            type: lesson.type,
            url: lesson.media.demo.hlsUrl,
            expiresIn: 1800,
        };
    }

}