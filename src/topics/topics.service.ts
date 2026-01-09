import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, Connection, ClientSession } from 'mongoose';
import { Topic, TopicDocument } from './schemas/topic.schema';

export interface TopicItem {
	_id: Types.ObjectId;
	name: string;
	description: string;
}

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
  ) {}

  async findActive(): Promise<TopicItem> {
    return this.topicModel
      .find({ isActive: true })
      .select('_id name description')
      .sort({ name: 1 })
      .lean<TopicItem>();
  }
}
