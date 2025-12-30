import { CanActivate, UnauthorizedException, Injectable, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { isValidObjectId, Types } from 'mongoose';
import { EnrollmentService } from './enrollment.service';

@Injectable()
export class CourseAccessGuard implements CanActivate {
	constructor(
		private readonly enrollmentService: EnrollmentService
	){}
	
	async canActivate(context: ExecutionContext): Promise<boolean>{
		const req = context.switchToHttp().getRequest();
		const user = req.user;
		const courseId = req.params.id;
		
		if(!user) return false;
		
		const isEnrolled = this.enrollmentService.isEnrolled(
			user.id,
			courseId
		);
		
		return !!isEnrolled
	}
}

