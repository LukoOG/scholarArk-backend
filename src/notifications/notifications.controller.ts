import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { ResponseHelper } from '../common/helpers/api-response.helper';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '../common/decorators'
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Types } from 'mongoose';
import { NotificationsService } from './notifications.service'

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService){}
	
	
}
