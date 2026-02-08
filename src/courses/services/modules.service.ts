import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CourseModule, CourseModuleDocument } from '../schemas/module.schema';
import { Types, Model } from 'mongoose';
import { CreateModuleDto } from '../dto/modules/create-module.dto';
import { Course, CourseDocument } from '../schemas/course.schema';

@Injectable()
export class ModulesService {
    constructor(
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        @InjectModel(CourseModule.name) private moduleModel: Model<CourseModuleDocument>,
    ) { }

    async createModule(courseId: Types.ObjectId, tutorId: Types.ObjectId, dto: CreateModuleDto) {
        const course = await this.courseModel.findOne({
            _id: courseId,
            tutor: tutorId
        })
            .lean()
            .exec();

        if (!course) throw new BadRequestException("Course not found");

        if (course.isPublished) throw new BadRequestException("Cannot edit published course");

        const lastModule = await this.moduleModel.findOne({ course: courseId })
            .sort({ position: -1 })
            .select('position')
            .lean()
            .exec();

        const nextPostion = lastModule.position ? lastModule.position + 1 : 1;

        const module = await this.moduleModel.create({
            course: courseId,
            title: dto.title,
            description: dto.description,
            position: nextPostion,
            isPublished: false,
        })

        return { moduleId: module._id }
    }
}