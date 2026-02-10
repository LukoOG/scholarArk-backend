import { CanActivate, UnauthorizedException, Injectable, ExecutionContext, Inject } from '@nestjs/common';
import { CourseAccessService } from '../services/course-access.service';

@Injectable()
export class CourseAccessGuard implements CanActivate {
	constructor(
		private readonly courseAccessService: CourseAccessService
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const user = req.user;
		const { courseId, lessonId, moduleId } = req.params;
		console.log("here", user.id, (courseId || lessonId || moduleId))

		if (!user && (!courseId || !lessonId || !moduleId)) return false

		return this.courseAccessService.canAccessCourse(
			user.id,
			user.role,
			courseId,
			moduleId,
			lessonId
		)
	}
}

@Injectable()
export class CourseOwnerGuard implements CanActivate {
	constructor(
		private readonly courseAccessService: CourseAccessService,
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const user = req.user;
		const { courseId, lessonId, moduleId } = req.params;

		return await this.courseAccessService.isTutorOwner(
			courseId,
			moduleId,
			lessonId,
			user.id,
		)
	}
}