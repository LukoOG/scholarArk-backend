import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, Model } from 'mongoose';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';

@Injectable()
export class EnrollmentService {
	constructor(
		@InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>
	){}
	async enroll(userId: Types.ObjectId, courseId: Types.ObjectId){
		console.log(userId, courseId)
		return this.enrollmentModel.create({
			user: userId,
			course: courseId,
			status: 'pending',
			isPaid: false
		})
	}
	
	async activateEnrollment(userId: Types.ObjectId, courseId: Types.ObjectId, paymentId: Types.ObjectId){
		return this.enrollmentModel.findOneAndUpdate(
			{user: userId, course: courseId},
			{
				status: 'active',
				isPaid: true,
				payment: paymentId,
			},
			{
				upsert: true,
				new: true
			}
		)
	}
	
	async isEnrolled(userId: Types.ObjectId, courseId: Types.ObjectId): Promise<boolean>{
		const enrollment = await this.enrollmentModel.findOne({
			user: userId,
			course: courseId,
			status: 'active'
		})
		.exec();
		return !!enrollment
	}
}