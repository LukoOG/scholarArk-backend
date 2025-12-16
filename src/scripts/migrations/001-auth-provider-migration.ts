import mongoose from 'mongoose';
import { UserSchema } from '../../user/schemas/user.schema';

async function migrate() {
  await mongoose.connect("mongodb+srv://emmanueladesipe01_db_user:VR3g1MACRaNYiKMD@cluster0.atxbvsc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

  const User = mongoose.model('User', UserSchema);

  const users = await User.find({
    authProvider: { $exists: true },
  });

  for (const user of users) {
    const provider = user.get('authProvider');

    user.set('authProviders', {
      local: provider === 'local',
      google: provider === 'google',
    });

    user.set('authProvider', undefined);
    await user.save();
  }

  console.log(`Migrated ${users.length} users`);
  process.exit(0);
}

migrate().catch(console.error);
