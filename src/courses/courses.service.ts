import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Course, CourseDocument } from './schemas/courses.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

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
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createCourseDto: CreateCourseDto, id:Types.ObjectId): Promise<Course> {
	  console.log('id', id)
    const course = new this.courseModel({
		...createCourseDto,
		createdBy: id
	});
	
    return course.save();
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
