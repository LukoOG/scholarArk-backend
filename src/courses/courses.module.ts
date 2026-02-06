import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { AwsSdkModule } from 'aws-sdk-v3-nest';
import { S3Client } from '@aws-sdk/client-s3';
import { CoursesService, ModulesService, LessonsService } from './services/';
import { CoursesController, ModulesController, LessonsController } from './controllers/';
import { Course, CourseSchema } from './schemas/course.schema';
import { CourseModule, CourseModuleSchema } from './schemas/module.schema';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { CourseAccessService } from './services/course-access.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { CourseAccessGuard } from './guards/course.guard';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { ConfigModule } from '@nestjs/config';
import { LessonMedia, LessonMediaSchema } from './schemas/lesson-media.schema';
import { CoursesDemoService } from './services/courses.demo.service';
import { TopicsModule } from 'src/topics/topics.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
		{ name: Course.name, schema: CourseSchema }, 
		{ name: CourseModule.name, schema: CourseModuleSchema },
		{ name: Lesson.name, schema: LessonSchema },
		{ name: LessonMedia.name, schema: LessonMediaSchema },
		{ name: User.name, schema: UserSchema },
	]),
	AwsSdkModule.register({
		client: new S3Client({
			region: 'us-east-1'
		})
	}),
	AuthModule,
	UserModule,
	CloudinaryModule,
	EnrollmentModule,
	TopicsModule,
	ConfigModule
  ],
  controllers: [CoursesController, ModulesController, LessonsController],
  providers: [CoursesService, ModulesService, LessonsService, CourseAccessService, CourseAccessGuard, CoursesDemoService],
  exports: [CoursesService, LessonsService]
})
export class CoursesModule {}
