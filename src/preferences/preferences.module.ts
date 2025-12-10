import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Preference, PreferenceSchema } from './schemas/preference.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
		 { name: Preference.name, schema: PreferenceSchema }
		])
	]
})
export class PreferencesModule {}
