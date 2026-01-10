import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Course, CourseDocument } from "../schemas/course.schema";
import { EnrollmentService } from "src/enrollment/enrollment.service";


@Injectable()
export class CourseAccessService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async canAccessCourse(userId: Types.ObjectId, role: string, courseId: Types.ObjectId) {
    const course = await this.courseModel
      .findById(courseId)
      .select('tutor isPublished')
      .lean();

    if (!course) return false;

    // Tutor owner always has access
    if (role === "tutor" && course.tutor.toString() === userId.toString()) {
      return true;
    }

    // Must be published
    if (!course.isPublished) return false;

    // Must be enrolled
    return this.enrollmentService.isEnrolled(userId, courseId);
  }
}
