import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, Connection, ClientSession } from 'mongoose';
import { Preference, PreferenceDocument } from './schemas/preference.schema';

@Injectable()
export class PreferenceService {
  constructor(
    @InjectModel(Preference.name) private preferenceModel: Model<PreferenceDocument>,
  ) {}

  async findActive() {
    return this.preferenceModel
      .find({ isActive: true })
      .select('_id key label description')
      .sort({ name: 1 })
      .lean();
  }
}
