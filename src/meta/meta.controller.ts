import { Controller, Get, UseInterceptors, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, } from '@nestjs/swagger';
import { TopicService } from '../topics/topics.service';
import { GoalService } from '../goals/goals.service';
import { PreferenceService } from '../preferences/preferences.service';
import { CacheInterceptor, CacheKey, CacheTTL, CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@ApiTags('Meta')
@Controller('meta')
@UseInterceptors(CacheInterceptor)
export class MetaController {
	constructor(
		private readonly topicService: TopicService,
		private readonly goalService: GoalService,
		private readonly preferenceService: PreferenceService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	){}
	
	@ApiOperation({
	  summary: 'Get available topics',
	  description: 'Used during user registration to select learning topics',
	})
	@ApiResponse({ status: 200, description: 'List of topics' })
	@CacheKey('meta:topics')
	@Get('topics')
	async getTopics(){
		let cacheData = await this.cacheManager.get('meta:topics')
		// console.log(this.cacheManager.stores);
		// console.log(cacheData, 'here')
		return this.topicService.findActive()
	}
	
	@ApiOperation({
	  summary: 'Get available goals',
	  description: 'Used during user registration to select learning goals',
	})
	@ApiResponse({ status: 200, description: 'List of topics' })
	
	@CacheKey('meta:goals')
	@Get('goals')
	async getGoals(){
		return this.goalService.findActive()
	}
	
	@ApiOperation({
	  summary: 'Get available preferences',
	  description: 'Used during user registration to select learning preferences',
	})
	@ApiResponse({ status: 200, description: 'List of topics' })
	@CacheKey('meta:preferences')
	@Get('preferences')
	async getPreferences(){
		return this.preferenceService.findActive()
	}
}
