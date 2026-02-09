import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Course, CourseDocument } from "../schemas/course.schema";
import { EnrollmentService } from "src/enrollment/enrollment.service";
import { Lesson, LessonDocument } from "../schemas/lesson.schema";
import { CourseModule, CourseModuleDocument } from "../schemas/module.schema";


@Injectable()
export class CourseAccessService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(CourseModule.name)
    private readonly moduleModel: Model<CourseModuleDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    private readonly enrollmentService: EnrollmentService,
  ) { }

  async canAccessCourse(userId: Types.ObjectId, role: string, courseId: Types.ObjectId, moduleId: Types.ObjectId, lessonId: Types.ObjectId) {
    let course;

    if (courseId) {
      course = await this.courseModel.findById(courseId).select('tutor isPublished').lean().exec();
    } else if (!courseId && moduleId) {
      let module = await this.moduleModel.findById(moduleId).select('course').lean().exec();

      if (!module) return false

      course = await this.courseModel.findById(module.course).select('tutor isPublished').lean().exec();
    }
    else if (!courseId && lessonId) {
      let lesson = await this.lessonModel.findById(lessonId).select('course isPreview').lean().exec()

      if (!lesson) return false;

      if (lesson.isPreview) return true; //For demo; access to free courses

      course = await this.courseModel.findById(lesson.course).select('tutor isPublished').lean().exec();
    }

    if (!course) return false;

    // Tutor owner always has access
    if (role === "tutor" && course.tutor.toString() === userId.toString()) {
      return true;
    }

    // Must be published
    if (!course.isPublished) return false;

    // Must be enrolled
    return this.enrollmentService.isEnrolled(userId, courseId);
    /// Demo: allowing access to all courses
    // return true
  }

  async isTutorOwner(courseId: Types.ObjectId, tutorId: Types.ObjectId) {
    const course = await this.courseModel.findById(courseId).lean().exec();

    if (!course) throw new NotFoundException("Course not found")
    if (course.tutor.toString() !== tutorId.toString()) throw new BadRequestException("You do not own this course");

    return true
  }
}
