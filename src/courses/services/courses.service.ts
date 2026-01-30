import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, Connection, ClientSession } from 'mongoose';
import { Course, CourseDocument, CourseListItem } from '../schemas/course.schema';
import { CourseModule, CourseModuleDocument } from '../schemas/module.schema';
import { Lesson, LessonDocument, LessonType } from '../schemas/lesson.schema';
import { LessonMediaStatus } from '../schemas/lesson-media.schema';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { CreateCourseDto } from '../dto/courses/create-course.dto';
import { UpdateCourseDto } from '../dto/courses/update-course.dto';
import {
	UserAlreadyExistsException,
	UserNotFoundException,
} from '../../user/exceptions';

import { PaginationDto } from '../../common/dto/pagination.dto';
import { CourseQueryDto } from '../dto/courses/course-filter.dto';
import { PaginatedResponse } from '../../common/interfaces';
import { CourseFullContent } from '../types/course-full-content.type';
import { PaymentCurrency } from 'src/payment/schemas/payment.schema';
import { CourseOutlineDto } from '../dto/courses/course-outline.dto';
import { GetObjectCommand, PutObjectCommand, S3Client, Type } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { InjectAws } from 'aws-sdk-v3-nest';
import { LessonMedia, LessonMediaDocument } from '../schemas/lesson-media.schema';
import { FILE_FORMAT_CONFIG, UploadLessonDto } from '../dto/courses/upload-course.dto';
import { EnrollmentService } from 'src/enrollment/enrollment.service';


@Injectable()
export class CoursesService {
	private env;
	constructor(
		@InjectModel(Course.name) private courseModel: Model<CourseDocument>,
		@InjectModel(CourseModule.name) private moduleModel: Model<CourseModuleDocument>,
		@InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
		@InjectModel(LessonMedia.name) private lessonMediaModel: Model<LessonMediaDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectConnection() private readonly connection: Connection,
		@InjectAws(S3Client) private readonly s3: S3Client,
		private readonly configService: ConfigService<Config, true>,
		private readonly enrollmentService: EnrollmentService,
	) {
		this.env = configService.get("redis", { infer: true })
	}

	private async validatePublishable(course: Course): Promise<void> {
		if (!course.title || !course.description) throw new BadRequestException("Course must contain basic details")

		if (course.modules.length === 0) throw new BadRequestException("Course must contain at least 1 module");
		console.log(course.prices.size)

		if (course.prices.size === 0) throw new BadRequestException("Course must have at least one price");

		const moduleIds = course.modules.map((id) => id.toString())
		console.log(moduleIds)

		const lessons = await this.lessonModel.find({
			module: { $in: moduleIds  }
		})
			.lean()
			.exec();

		if (lessons.length === 0) throw new BadRequestException("Course must contain at least 1 lesson");

		for (const lesson of lessons) {
			if (!lesson.isPublished) throw new BadRequestException(`Lesson ${lesson.title} is not published`);

			if (lesson.type === LessonType.VIDEO) {
				if (!lesson.media) throw new BadRequestException(`Video missing for lesson "${lesson.title}"`);
				if (lesson.media.status !== 'ready') throw new BadRequestException(`Video upload not completed for "${lesson.title}"`)
			}
		}
	}

	async isTutor(courseId: Types.ObjectId, userId: Types.ObjectId) {
		const isTutor = await this.courseModel
			.findOne({ _id: courseId, tutor: userId })
			.select('_id')
			.lean()

		return !!isTutor
	}

	async incrementEnrolledStudents(courseId: Types.ObjectId): Promise<void>{
		await this.courseModel.findByIdAndUpdate(
			courseId,
			{ $inc: { studentsEnrolled: 1 } },
			{ runValidators: true }
		)
	}

	async create(dto: CreateCourseDto, tutorId: Types.ObjectId): Promise<{ courseId: Types.ObjectId }> {
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
						thumbnailUrl: dto.thumbnailUrl,
						isPublished: false,
					}
				],
				{ session },
			);

			const courseId = course[0]._id;
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
								media: modLesson.media
							}
						],
						{ session },
					)

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
			return { courseId }
		} catch (error) {
			await session.abortTransaction();
			throw error
		} finally {
			session.endSession();
		};
	}

	async findAll(dto: CourseQueryDto): Promise<PaginatedResponse<CourseListItem>> {
		const { page = 1, limit = 20, topicIds, level, search, goalIds } = dto;
		const skip = (page - 1) * limit;

		const query: any = {
			isPublished: true,
			isDeleted: { $ne: true },
		};

		if (topicIds?.length) {
			query.topicIds = { $in: topicIds };
		};

		if (level) {
			query.difficulty = level;
		};

		if (goalIds?.length) {
			query.goalIds = { $in: goalIds }
		};

		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
			];
		};

		const [items, total] = await Promise.all([
			this.courseModel
				.find(query)
				.select(
					'title thumbnail_url price rating category difficulty students_enrolled prices'
				)
				.populate({
					path: "tutor",
					select: "first_name last_name email profile_pic"
				})
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.lean<CourseListItem[]>(),

			this.courseModel.countDocuments(query),
		]);

		return {
			items,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
				hasNextPage: page * limit < total,
			},
		};
	}

	async getEnrolledCourses(userId: Types.ObjectId) {
		const courseIds = await this.enrollmentService.userEnrolledCourses(userId);
		const items = await this.courseModel
			.find({
				_id: { $in: courseIds }
			})
			.select(
				'title thumbnail_url price rating category difficulty students_enrolled prices'
			)
			.populate({
				path: "tutor",
				select: "first_name last_name email profile_pic"
			})
			.lean<CourseListItem[]>();
		return {
			items,
			meta: {
				total: items.length,
				// page,
				// limit,
				// totalPages: Math.ceil(total / limit),
				// hasNextPage: page * limit < total,
			},
		};
	}

	async getTutorOwnedCourses(tutorId: Types.ObjectId){
		const items = await this.courseModel.find({
			tutor: tutorId
		})
		.select("")
		.lean<CourseListItem>()
		.exec();

		return {
			items,
			meta: {}
		}
	}

	async getTutorOwnedCoursesById(tutorId: Types.ObjectId){
		const items = await this.courseModel.find({
			tutor: tutorId
		})
		.lean<CourseListItem>()
		.exec();

		return {
			items,
			meta: {}
		}
	}

	async getRecommended(userId: Types.ObjectId) {
		const user = await this.userModel
			.findById(userId)
			.select('goalsIds topicsIds preferencesIds')
			.exec();

		if (!user) throw new UserNotFoundException();
		console.log(user.goalsIds, user.topicsIds)

		return this.courseModel
			.find({
				$or: [
					{ goals: { $in: user.goalsIds } },
					{ topics: { $in: user.topicsIds } },
				],
			})
			.limit(10)
			.sort({ popularity: -1 })
			.exec();
	}

	async getFullContent(courseId: Types.ObjectId) {
		const course = await this.courseModel
			.findById(courseId)
			.select('title description tutor modules')
			.populate({
				path: 'tutor',
				select: 'name',
			})
			.populate({
				path: 'modules',
				select: 'title position lessons',
				options: { sort: { position: 1 } },
				populate: {
					path: 'lessons',
					select: 'title position type content',
					options: { sort: { position: 1 } },
				},
			})
			.lean<CourseFullContent>();

		if (!course) {
			throw new NotFoundException('Course not found');
		}
		return course;
	}

	async getOutline(courseId: Types.ObjectId): Promise<CourseOutlineDto> {
		const course = await this.courseModel.findOne({
			_id: courseId,
			isPublished: true,
		})
			.select('title description totalDuration prices')
			.lean<{ title: string; description: string; totalDuration: number }>();

		if (!course) throw new NotFoundException();

		const modules = await this.moduleModel
			.find({ course: courseId })
			.select('_id title position totalDuration')
			.sort({ position: 1 })
			.lean<{
				_id: Types.ObjectId;
				title: string;
				position: number;
				totalDuration: number;
			}[]>()
			.exec();

		const moduleIds = modules.map(m => m._id);
		console.log(moduleIds)

		const lessons = await this.lessonModel
			.find({ module: { $in: moduleIds } })
			.select('_id title position module duration isPreview')
			.sort({ position: 1 })
			.lean<{
				_id: Types.ObjectId;
				module: Types.ObjectId;
				title: string;
				position: number;
				duration: number;
				isPreview: boolean;
			}[]>()
			.exec();

		return {
			...course,
			modules: modules.map(m => ({
				...m,
				lessons: lessons.filter(l => l.module.equals(m._id)),
			})),
		};
	}

	async findOne(id: string): Promise<Course> {
		const course = await this.courseModel
			.findById(id)
			.select('-modules')
			.exec();

		if (!course) throw new NotFoundException(`Course #${id} not found`); return course;
	}

	async update(id: string, dto: UpdateCourseDto): Promise<Course> {
		const updatePayload = {};

		const session: ClientSession = await this.connection.startSession();

		if (dto.modules) {
			for (let i = 0; i < dto.modules.length; i++) {
				const mod = dto.modules[i]

				const module = await this.moduleModel.updateOne(
					[],
					{ session }
				)
			}
		}
		const course = await this.courseModel.findByIdAndUpdate(id, dto).exec();
		if (!course) throw new NotFoundException(`Course #${id} not found`);
		return course;
	}

	async remove(id: string): Promise<void> {
		const result = await this.courseModel.findByIdAndDelete(id).exec();
		if (!result) throw new NotFoundException(`Course #${id} not found`);
	}

	async publishCourse(courseId: Types.ObjectId, tutorId: Types.ObjectId) {
		const course = await this.courseModel.findOne({
			_id: courseId,
			tutor: tutorId
		})
			.exec();

		if (!course) throw new NotFoundException("Course not found");

		if (course.isPublished) throw new BadRequestException("Course is already published");

		await this.validatePublishable(course)

		course.isPublished = true;
		course.publishedAt = new Date();

		await course.save()

		return { "message": "Course published successfully" }
	}

	async publishLesson(courseId: Types.ObjectId, lessonId: Types.ObjectId, tutorId: Types.ObjectId) {
		const lesson = await this.lessonModel
			.findById(lessonId)
			.populate<{ course: { _id: Types.ObjectId, tutor: Types.ObjectId } }>({ path: 'course', select: '_id tutor' })
			.exec();

		if (!lesson) throw new NotFoundException();
		if (lesson.course._id !== courseId) throw new BadRequestException("Wrong course for lesson")
		if (lesson.course.tutor.toString() !== tutorId.toString()) {
			throw new ForbiddenException();
		}

		if (lesson.type === LessonType.VIDEO) {
			if (!lesson.media || lesson.media.status !== LessonMediaStatus.READY) {
				throw new BadRequestException('Video not ready');
			}
		}

		lesson.isPublished = true;
		await lesson.save();
	}

	async getCoursePrice(courseId: Types.ObjectId, currency: PaymentCurrency): Promise<number> {
		const course = await this.courseModel.findById(courseId).select('prices isPublished').lean().exec();

		if (!course) throw new NotFoundException("Course not found");

		if (!course.isPublished) throw new BadRequestException("Course is not available for purchase");

		const amount = course.prices?.[currency];

		if (!amount) throw new BadRequestException(`Course is not available to purchase in ${currency}`);

		return amount
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

		if (lesson.media.status !== LessonMediaStatus.PENDING) {
			throw new BadRequestException('Media already completed');
		}

		lesson.media.status = LessonMediaStatus.READY;
		await lesson.save();
	}

	async getLessonUrl(lessonId: Types.ObjectId) {
		const lesson = await this.lessonModel.findById(lessonId);

		if (!lesson) throw new NotFoundException("Lesson not found");

		if (!lesson.media) throw new BadRequestException("Lesson media is not uploaded");

		if (![LessonMediaStatus.READY, LessonMediaStatus.UPLOADED].includes(lesson.media.status)) throw new BadRequestException("Video not ready for playback");

		const command = new GetObjectCommand({
			Bucket: this.env.bucket,
			Key: lesson.media.s3key
		})

		const url = await getSignedUrl(this.s3, command, {
			expiresIn: 600 * 5,
		});

		return {
			type: lesson.type,
			url,
			expiresIn: 600 * 5,
		};
	}

}

