import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Goal, GoalSchema } from './schemas/goal.schema';
import { GoalService } from './goals.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Goal.name, schema: GoalSchema },
    ]),
  ],
	providers: [GoalService],
	exports: [GoalService],
})
export class GoalsModule {}
