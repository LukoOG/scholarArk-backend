import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { ResponseHelper } from '../common/helpers/api-response.helper';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '../common/decorators'
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Types } from 'mongoose';
import { SaveFcmTokenDto } from './dto/save-fcm-token.dto';
import { NotificationsService } from './notifications.service'

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService){}
	
	@UseGuards(AuthGuard) //make controller-level if need be later
	@Patch('me/fcm-token')
	@ApiBearerAuth()
	@ApiOperation({ description: "save fcm token for user (per device)" })
	async saveToken(@GetUser('id') id: Types.ObjectId, @Body() dto: SaveFcmTokenDto){
		await this.notificationsService.saveFcmToken(id, dto)
	}
	
}
