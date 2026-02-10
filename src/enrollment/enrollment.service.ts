import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, Model } from 'mongoose';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
  ) { }
  async enroll(userId: Types.ObjectId, courseId: Types.ObjectId) {
    const exists = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
    });

    if (exists) return exists;

    return this.enrollmentModel.create({
      user: userId,
      course: courseId,
      status: 'active',
      isPaid: true,
    });
  }

  async activateEnrollment(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    paymentId: Types.ObjectId,
  ) {
    return this.enrollmentModel.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        status: 'active',
        isPaid: true,
        payment: paymentId,
      },
      {
        upsert: true,
        new: true,
      },
    );
  }

  async isEnrolled(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
  ): Promise<boolean> {
    console.log("here",userId, courseId)
    const enrollment = await this.enrollmentModel
      .findOne({
        user: userId,
        course: courseId,
        status: 'active',
      })
      .exec();
    return !!enrollment;
  }

  async revokeAccess(userId: Types.ObjectId, courseId: Types.ObjectId) {
    return this.enrollmentModel
      .updateOne(
        { user: userId, course: courseId },
        {
          $set: { status: 'refunded', isPaid: false },
        },
      )
      .exec();
  }

  async userEnrolledCourses(userId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const enrollments = await this.enrollmentModel.find({
      user: userId
    }).lean().exec();

    const courseIds = enrollments.map((c) => new Types.ObjectId(c.course));

    return courseIds
  }
}
