import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AssessmentsService } from './services/assessments.service';
import { AssessmentsController } from './controllers/assessments.controller';
import { AiService } from '../common/services/AI.service'; 
import { Assessment, AssessmentSchema } from './schemas/assessments.schema';
import { Attempt, AttemptSchema} from './schemas/attempt.schema';
import { UserModule } from '../user/user.module';
import { CoursesModule } from 'src/courses/courses.module';
import { QuestionBankController } from './controllers/question-bank.controller';
import { QuestionsService } from './services/question-bank.service';
import { Question, QuestionSchema } from './schemas/question.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Attempt.name, schema: AttemptSchema },
    ]),
	UserModule,
	AuthModule,
  CoursesModule
  ],
  controllers: [AssessmentsController, QuestionBankController],
  providers: [AssessmentsService, QuestionsService, AiService],
})
export class AssessmentsModule {}
