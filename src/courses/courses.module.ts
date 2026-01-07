import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { CoursesService } from './services/courses.service';
import { CoursesController } from './controllers/courses.controller';
import { Course, CourseSchema } from './schemas/course.schema';
import { CourseModule, CourseModuleSchema } from './schemas/module.schema';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { CourseAccessService } from './services/course-access.service';
import { CourseAccessGuard } from './guards/course.guard';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
		{ name: Course.name, schema: CourseSchema }, 
		{ name: CourseModule.name, schema: CourseModuleSchema },
		{ name: Lesson.name, schema: LessonSchema },
		{ name: User.name, schema: UserSchema },
	]),
	AuthModule,
	CloudinaryModule,
	EnrollmentModule
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CourseAccessService, CourseAccessGuard],
  exports: [CoursesService]
})
export class CoursesModule {}
