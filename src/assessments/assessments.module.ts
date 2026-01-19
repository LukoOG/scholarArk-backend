import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';
import { AiService } from '../common/services/AI.service'; 
import { Assessment, AssessmentSchema } from './schemas/assessments.schema';
import { Attempt, AttemptSchema} from './schemas/attempt.schema';
import { UserModule } from '../user/user.module';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: Attempt.name, schema: AttemptSchema },
    ]),
	UserModule,
	AuthModule,
  CoursesModule
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AiService],
})
export class AssessmentsModule {}
