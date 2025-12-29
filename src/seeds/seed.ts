import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Topic } from '../topics/schemas/topic.schema';
import { Goal } from '../goals/schemas/goal.schema';
import { Preference } from '../preferences/schemas/preference.schema';

import { TOPICS } from './topics.seed';
import { GOALS } from './goals.seed';
import { PREFERENCES } from './preferences.seed';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const topicModel = app.get<Model<Topic>>(getModelToken(Topic.name));
  const goalModel = app.get<Model<Goal>>(getModelToken(Goal.name));
  const preferenceModel = app.get<Model<Preference>>(getModelToken(Preference.name));

  await topicModel.insertMany(TOPICS, { ordered: false }).catch(() => {});
  await goalModel.insertMany(GOALS, { ordered: false }).catch(() => {});
  await preferenceModel.insertMany(PREFERENCES, { ordered: false }).catch(() => {});

  console.log('✅ Seeding complete');
  await app.close();
}

seed();
