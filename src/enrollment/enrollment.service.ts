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
		return this.enrollmentModel.create({
			user: userId,
			course: courseId,
			status: 'active',
			isPaid: false
		})
	}
	
	async isEnrolled(userId: Types.ObjectId, courseId: Types.ObjectId){
		return this.enrollmentModel.exists({
			user: userId,
			corse: courseId,
			status: 'active'
		})
	}
}