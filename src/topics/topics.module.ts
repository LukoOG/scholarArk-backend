import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './schemas/topic.schema';
import { TopicService } from './topics.service';

@Module({
	imports: [
		MongooseModule.forFeature([
		 { name: Topic.name, schema: TopicSchema }
		])
	],
	providers: [TopicService],
	exports: [TopicService],
})
export class TopicsModule {}
