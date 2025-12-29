import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Preference, PreferenceSchema } from './schemas/preference.schema';
import { PreferenceService } from './preferences.service';

@Module({
	imports: [
		MongooseModule.forFeature([
		 { name: Preference.name, schema: PreferenceSchema }
		])
	],
	providers: [PreferenceService],
	exports: [PreferenceService],
})
export class PreferencesModule {}
