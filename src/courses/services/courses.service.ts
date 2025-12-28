import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Course, CourseDocument } from '../schemas/course.schema';
import { CourseModule, CourseModuleDocument } from '../schemas/module.schema';
import { Lesson, LessonDocument } from '../schemas/lesson.schema';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../user/exceptions';

import { PaginationDto } from '../common/dto/pagination.dto';
import { CourseFilterDto } from './dto/course-filter.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(CourseModule.name) private moduleModel: Model<CourseDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
	private readonly cloudinaryService: CloudinaryService,
	private readonly connection: Connection,
  ) {}

  async create(dto: CreateCourseDto, tutorId:Types.ObjectId, file?: Express.Multer.File): Promise<Course> {
	let resourceUrl: string | undefined;
	const session = this.connection.startSession();
	
	if(file){
		resourceUrl = await this.cloudinaryService.uploadImage(file, 'users/profile-pics')
	};
	
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
					price: dto.price,
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
						courseId,
						title: mod.title,
						description: mod.description,
						position: i + 1,
					},
				], 
				{ session }
			)
			
			let moduleDuration = 0;
			
			for(let j = 0; j < mod.lessons.length; j++){
				const lesson = mod.lessons[j];
				
				await this.lessonModel.create(
					[
						{
							courseId,
							moduleId: module[0]._id,
							title: lesson.title,
							type: lesson.type,
							videoUrl: lesson.videoUrl,
							content: lesson.content,
							duration: lesson.duration,
							position: j + 1,
							isPreview: lesson.isPreview ?? false,
						}
					],
					{ session },
				)
				
				moduleDuration += lesson.duration;
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

  async findAll(pagination: PaginationDto, filters: CourseFilterDto ) {
	const { page, limit } = pagination;
	const skip = (page - 1) * limit;
	
	const query: FilterQuery<Course> = {};	
	
	const [items, total] = await Promise.all([
		this.courseModel
		  .find(query)
		  .skip(skip)
		  .limit(limit)
		  .sort({ createdAt: -1 })
		  .exec(),

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

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id).exec();
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
}
