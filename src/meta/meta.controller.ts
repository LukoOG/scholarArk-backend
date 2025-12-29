import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, } from '@nestjs/swagger';
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
	
	@ApiOperation({
	  summary: 'Get available topics',
	  description: 'Used during user registration to select learning topics',
	})
	@ApiResponse({ status: 200, description: 'List of topics' })
	@Get('topics')
	async getTopics(){
		return this.topicService.findActive()
	}
	
	@ApiOperation({
	  summary: 'Get available goals',
	  description: 'Used during user registration to select learning goals',
	})
	@ApiResponse({ status: 200, description: 'List of topics' })
	@Get('goals')
	async getGoals(){
		return this.goalService.findActive()
	}
	
	@ApiOperation({
	  summary: 'Get available preferences',
	  description: 'Used during user registration to select learning preferences',
	})
	@ApiResponse({ status: 200, description: 'List of topics' })
	@Get('preferences')
	async getPreferences(){
		return this.preferenceService.findActive()
	}
}
