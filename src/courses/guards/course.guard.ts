import { CanActivate, UnauthorizedException, Injectable, ExecutionContext, Inject } from '@nestjs/common';
import { CourseAccessService } from '../services/course-access.service';

@Injectable()
export class CourseAccessGuard implements CanActivate {
	constructor(
		private readonly courseAccessService: CourseAccessService
	){}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const user = req.user;
		const courseId = req.params.courseId;
		//console.log("here", user, user.id, courseId)

		if(!user || !courseId) return false

		return this.courseAccessService.canAccessCourse(
			user.id,
			user.role,
			courseId
		)
	}
}

@Injectable()
export class CourseOwnerGuard implements CanActivate {
	constructor(
		private readonly courseAccessService: CourseAccessService,
	){}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const user = req.user;
		const courseId = req.params.courseId

		return await this.courseAccessService.isTutorOwner(courseId, user.id)
	}
}