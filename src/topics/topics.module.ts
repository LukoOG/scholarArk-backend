import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './schemas/topic.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
		 { name: Topic.name, schema: TopicSchema }
		])
	]
})
export class TopicsModule {}
