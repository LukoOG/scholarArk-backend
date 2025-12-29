import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { TopicService } from '../topics/topics.service';
import { GoalService } from '../goals/goals.service';
import { PreferenceService } from '../preferences/preferences.service';

@ApiTags('Meta')
@Controller('meta')
export class MetaController {
	constructor(
		private readonly topicService: TopicService,
		private readonly goalService: GoalService,
		private readonly preferenceService: PreferenceService,
	){}
	
	@Get()
	async getTopics(){
		return this.topicService.findActive()
	}
	
	@Get()
	async getGoals(){
		return this.goalService.findActive()
	}
	
	@Get()
	async getPreferences(){
		return this.preferenceService.findActive()
	}
}
