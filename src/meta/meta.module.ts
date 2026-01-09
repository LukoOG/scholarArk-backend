import { Module } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { TopicsModule } from '../topics/topics.module';
import { GoalsModule } from '../goals/goals.module';
import { PreferencesModule } from '../preferences/preferences.module';

@Module({
  imports: [ TopicsModule, GoalsModule, PreferencesModule ],
  controllers: [MetaController]
})
export class MetaModule {}
