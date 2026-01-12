import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, Connection, ClientSession } from 'mongoose';
import { Course, CourseDocument, CourseListItem } from '../schemas/course.schema';
import { CourseModule, CourseModuleDocument } from '../schemas/module.schema';
import { Lesson, LessonDocument, LessonType } from '../schemas/lesson.schema';
import { LessonMediaStatus } from '../schemas/lesson-media.schema';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import {
	UserAlreadyExistsException,
	UserNotFoundException,
} from '../../user/exceptions';

@Injectable()
export class LessonsService {
    constructor(){}
}