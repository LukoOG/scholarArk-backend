import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';
import { AuthModule } from '../auth/auth.module';
import { CourseModule } from 'src/courses/schemas/module.schema';

@Module({
  imports: [
	MongooseModule.forFeature([
		{ name: Enrollment.name, schema: EnrollmentSchema }
	]),
	AuthModule
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService]
})
export class EnrollmentModule {}
