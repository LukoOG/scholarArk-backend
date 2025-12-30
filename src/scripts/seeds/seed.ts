import mongoose from 'mongoose';

import { TopicSchema } from '../../topics/schemas/topic.schema';
import { GoalSchema } from '../../goals/schemas/goal.schema';
import { PreferenceSchema } from '../../preferences/schemas/preference.schema';

import { TOPICS } from './topics.seed';
import { GOALS } from './goals.seed';
import { PREFERENCES } from './preferences.seed';

async function seed() {
	await mongoose.connect("mongodb+srv://emmanueladesipe01_db_user:VR3g1MACRaNYiKMD@cluster0.atxbvsc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

  const topicModel = mongoose.model('Topic', TopicSchema);
  const goalModel = mongoose.model('Goal', GoalSchema);
  const preferenceModel = mongoose.model('Preference', PreferenceSchema);

  await topicModel.insertMany(TOPICS, { ordered: false }).catch(() => {});
  await goalModel.insertMany(GOALS, { ordered: false }).catch(() => {});
  await preferenceModel.insertMany(PREFERENCES, { ordered: false }).catch(() => {});

  console.log('✅ Seeding complete');
  process.exit(0);
}

seed().catch(err => {
	console.error(err);
	process.exit(1);
});
