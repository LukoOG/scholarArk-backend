import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Lesson, LessonDocument, LessonType } from "../schemas/lesson.schema";
import { Model, Types } from "mongoose";
import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UploadLessonDto, FILE_FORMAT_CONFIG } from "../dto/courses/upload-course.dto";
import { LessonMedia, LessonMediaDocument, LessonMediaStatus } from "../schemas/lesson-media.schema";
import { Config } from "src/config";
import { ConfigService } from "@nestjs/config";
import { InjectAws } from "aws-sdk-v3-nest";

@Injectable()
export class LessonsService {
    private env: Config['aws']
    constructor(
        @InjectModel(Lesson.name) private readonly lessonModel: Model<LessonDocument>,
        @InjectModel(LessonMedia.name) private readonly lessonMediaModel: Model<LessonMediaDocument>,
        @InjectAws(S3Client) private readonly s3: S3Client,
        private readonly configService: ConfigService<Config, true>
    ) { 
        this.env = this.configService.get('aws', { infer: true })
    }

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


    async getUploadUrl(lessonId: Types.ObjectId, courseId: Types.ObjectId, tutorId: Types.ObjectId, dto: UploadLessonDto) {
        const lesson = await this.lessonModel.findOne({ _id: lessonId, course: courseId })
            .populate<{ course: { tutor: Types.ObjectId } }>({ path: "course", select: "tutor" }).exec();


        if (!lesson) throw new NotFoundException("Lesson not found");

        if (lesson.course.tutor.toString() !== tutorId.toString()) throw new BadRequestException("You do not own this course");

        const format = FILE_FORMAT_CONFIG[dto.type];
        if (!format) throw new BadRequestException("Unsupported File Format");

        if (lesson.type === LessonType.VIDEO && format.kind !== 'video') {
            throw new BadRequestException('Lesson expects a video upload');
        }

        if (lesson.type === LessonType.ARTICLE && format.kind !== 'article') {
            throw new BadRequestException('Lesson expects an article upload');
        }

        const key = `courses/${courseId}/lessons/${lessonId}/video-${Date.now()}.mp4`;

        const command = new PutObjectCommand({
            Bucket: this.env.bucket,
            Key: key,
            ContentType: format.contentType,
            Metadata: {
                lessonId: lessonId.toString(),
                courseId: courseId.toString(),
                type: format.kind,
            }
        })

        const media = await this.lessonMediaModel.create({
            s3key: key,
            mimeType: format.contentType,
        })

        lesson.media = media;
        await lesson.save();

        const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 60 * 5 })

        return { url: signedUrl, key, expiresIn: 300 }
    }

    async completeMediaUpload(lessonId: Types.ObjectId, tutorId: Types.ObjectId) {
        const lesson = await this.lessonModel
            .findById(lessonId)
            .populate<{ course: { tutor: Types.ObjectId } }>({
                path: 'course',
                select: 'tutor',
            }).exec();

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        if (lesson.course.tutor.toString() !== tutorId.toString()) {
            throw new ForbiddenException('You do not own this course');
        }

        if (lesson.type !== LessonType.VIDEO) {
            throw new BadRequestException('Lesson is not a video');
        }

        if (!lesson.media) {
            throw new BadRequestException('No media found for lesson');
        }

        if (lesson.media.status !== LessonMediaStatus.PROCESSING) {
            throw new BadRequestException('Media already completed');
        }

        lesson.media.status = LessonMediaStatus.UPLOADED;
        await lesson.save();
    }

    async getLessonUrl(lessonId: Types.ObjectId) {
        const lesson = await this.lessonModel.findById(lessonId);

        if (!lesson) throw new NotFoundException("Lesson not found");

        if (!lesson.media) throw new BadRequestException("Lesson media is not uploaded");

        if (![LessonMediaStatus.UPLOADED].includes(lesson.media.status)) throw new BadRequestException("Video not ready for playback");

        const command = new GetObjectCommand({
            Bucket: this.env.bucket,
            Key: lesson.media.s3key,
            ResponseContentType: lesson.media.mimeType,
            ResponseContentDisposition: "inline"
        })

        const expiryTime = lesson.media.duration + (1000 * 3)

        const url = await getSignedUrl(this.s3, command, {
            expiresIn: expiryTime,
        });

        return {
            type: lesson.type,
            url,
            expiresIn: expiryTime,
        };
    }
}