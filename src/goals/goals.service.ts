import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, Connection, ClientSession } from 'mongoose';
import { Goal, GoalDocument } from './schemas/goal.schema';

export interface GoalItem {
	_id: Types.ObjectId;
	name: string;
	description: string;
}

@Injectable()
export class GoalService {
  constructor(
    @InjectModel(Goal.name) private goalModel: Model<GoalDocument>,
  ) {}

  async findActive(): Promise<GoalItem> {
    return this.goalModel
      .find({ isActive: true })
      .select('_id name description')
      .sort({ name: 1 })
      .lean<GoalItem>();
  }
}
