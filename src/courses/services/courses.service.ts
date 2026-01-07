import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, Connection, ClientSession } from 'mongoose';
import { Course, CourseDocument, CourseListItem } from '../schemas/course.schema';
import { CourseModule, CourseModuleDocument } from '../schemas/module.schema';
import { Lesson, LessonDocument } from '../schemas/lesson.schema';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../../user/exceptions';

import { PaginationDto } from '../../common/dto/pagination.dto';
import { CourseQueryDto } from '../dto/course-filter.dto';
import { PaginatedResponse } from '../../common/interfaces';
import { CourseFullContent } from '../types/course-full-content.type';
import { PaymentCurrency } from 'src/payment/schemas/payment.schema';


@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(CourseModule.name) private moduleModel: Model<CourseModuleDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
	@InjectConnection() private readonly connection: Connection,
	private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateCourseDto, tutorId:Types.ObjectId): Promise<{ courseId: Types.ObjectId }>{
	const session: ClientSession = await this.connection.startSession();
	
	session.startTransaction();
	try{
		const course = await this.courseModel.create(
			[
				{
					tutor: tutorId,
					title: dto.title,
					description: dto.description,
					category: dto.category,
					difficulty: dto.difficulty,
					prices: dto.prices,
					isPublished: false,
				}
			],
			{ session },
		);
		
		const courseId = course[0]._id;
		let totalCourseDuration = 0;
		
		for(let i = 0; i < dto.modules.length; i++){
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
				{_id: courseId},
				{ $push: { modules: module[0]._id } },
				{ session }
			);
			
			let moduleDuration = 0;
			
			for(let j = 0; j < mod.lessons.length; j++){
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
	}catch(error){
		await session.abortTransaction();
		throw error
	}finally{
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
	
	if(topicIds?.length){
		query.topicIds = { $in: topicIds };
	};
	
	if(level){
		query.difficulty = level;
	};
	
	if(goalIds?.length){
		query.goalIds = { $in: goalIds }
	};
	
	if(search){
		query.$or = [
		  { title: { $regex: search, $options: 'i' } },
		  { description: { $regex: search, $options: 'i' } },
		];
	};
	
	const [items, total] = await Promise.all([
		this.courseModel
		  .find(query)
		  .select(
			'title thumbnail_url price rating category difficulty students_enrolled'
		  )
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
  
  
  async getRecommended(userId: Types.ObjectId) {
	const user = await this.userModel
		.findById(userId)
		.select('goals topics')
		.exec();
	
	if (!user) throw new UserNotFoundException();
	
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

  async getFullContent(courseId: Types.ObjectId){
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

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel
	.findById(id)
	.select('-modules')
	.exec();
	
    if (!course) throw new NotFoundException(`Course #${id} not found`);
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, { new: true }).exec();
    if (!course) throw new NotFoundException(`Course #${id} not found`);
    return course;
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Course #${id} not found`);
  }

  //
  async isTutor(courseId: Types.ObjectId, userId: Types.ObjectId){
	const isTutor = await this.courseModel
	.findOne({ _id: courseId, tutor: userId })
	.select('_id')
	.lean()

	return !!isTutor
  }

  async getCoursePrice(courseId: Types.ObjectId, currency: PaymentCurrency): Promise<number>{
	const course = await this.courseModel.findById(courseId).select('prices isPublished').lean().exec();

	if(!course) throw new NotFoundException("Course not found");

	if(!course.isPublished) throw new BadRequestException("Course is not available for purchase");

	const amount = course.prices?.[currency];

	if (!amount) throw new BadRequestException(`Course is not available to purchase in ${currency}`);

	return amount
  }
}
