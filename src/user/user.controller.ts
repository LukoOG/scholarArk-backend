import { Controller, Get, Post, Req, Body, Param, Delete, Patch, Query, HttpCode, HttpStatus, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/multer/multer.config';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiBearerAuth, ApiCreatedResponse, ApiBadRequestResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SaveFcmTokenDto } from './dto/save-fcm-token.dto';
import { ResponseHelper } from '../common/helpers/api-response.helper';
import { GetUser } from '../common/decorators'
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Types } from 'mongoose';
import { OnboardingStatusDto } from './dto/onboarding-status.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) { }

	@Get()
	async findAll(@Query('role') role?: 'student' | 'tutor') {
		const response = await this.userService.findAll(role);
		return ResponseHelper.success(response)
	}

	@UseGuards(AuthGuard)
	@Get('me')
	async findOneMe(@GetUser('id') id: Types.ObjectId) {
		const response = await this.userService.findOne(id);
		return ResponseHelper.success(response)
	}

	@UseGuards(AuthGuard)
	@Patch('me')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Complete user registration or update user profile',
		description: `
	This endpoint is used for **two purposes**:

	1. **Complete Registration Flow**  
	   After registering or signing in with Google, users must finish onboarding by supplying preferences, topics, goals, etc.

	2. **Regular Profile Update**  
	   Allows an authenticated user to edit their profile information.

	📌 **Mobile Developers:**  
	You MUST pass the access token in the request header:  
	\`Authorization: Bearer <access_token>\`
	  `,
	})
	@ApiBody({
		type: UpdateUserDto,
		description: 'Fields required to complete user profile',
	})
	@ApiResponse({
		status: 200,
		description: 'Profile completed successfully',
		schema: {
			example: {
				data: {
					user: {
						_id: '6730b2cfb8c2a12b4e9b25cd',
						username: 'emmanuel',
						email: { value: 'emma@test.com', verified: true },
						role: 'STUDENT',
						preferences: [],
						goals: ['master backend engineering'],
						topics: ['nestjs', 'mongodb'],
					},
				},
			},
		},
	})
	async updateMe(@Req() req, @GetUser('id') id: Types.ObjectId, @Body() updateUserDto: UpdateUserDto) {
		const response = await this.userService.update(id, updateUserDto);
		return ResponseHelper.success(response)
	}

	@UseGuards(AuthGuard)
	@Patch('me/fcm-token')
	@ApiBearerAuth()
	@ApiOperation({ description: "save fcm token for user (per device)" })
	async saveToken(@GetUser('id') id: Types.ObjectId, @Body() dto: SaveFcmTokenDto) {
		await this.userService.saveFcmToken(id, dto)
		return ResponseHelper.success({ message: "Token saved!" })
	}

	@Post('accept-terms')
	@UseGuards(AuthGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Accept Terms and Conditions',
		description: 'Marks the authenticated user as having accepted the terms and conditions.',
	})
	@ApiResponse({
		status: 200,
		description: 'Terms accepted successfully',
		example: {
			message: 'Terms accepted successfully',
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
	})
	async acceptTerms(
		@GetUser('id') userId: Types.ObjectId,
	) {
		await this.userService.acceptTerms(userId);

		return ResponseHelper.success(
			{ message: 'Terms accepted successfully' },
			HttpStatus.OK,
		);
	}

	@Post('complete-onboarding')
	@UseGuards(AuthGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Complete user onboarding',
		description: `
Finalizes onboarding for the authenticated user.

Requirements:
- Terms and Conditions accepted
- Profile completed
- All Meta selected: That is, goals, topics and preferences
`,
	})
	@ApiResponse({
		status: 200,
		description: 'Onboarding completed successfully',
		example: {
			message: 'Onboarding completed successfully',
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Onboarding requirements not met',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
	})
	async completeOnboarding(
		@GetUser('id') userId: Types.ObjectId,
	) {
		await this.userService.completeOnboarding(userId);

		return ResponseHelper.success(
			{ message: 'Onboarding completed successfully' },
			HttpStatus.OK,
		);
	}

	@Get('me/profile-completed')
	@UseGuards(AuthGuard)
	@ApiBearerAuth()
	@ApiOperation({
		summary: "Get user's onboarding status",
		description: `
Returns the current onboarding state of the authenticated user.

This endpoint is used by the client to determine:
- Whether the user has accepted Terms & Conditions
- Whether profile setup is complete
- Whether preferences have been selected
- Whether onboarding should be enforced or skipped

Typical usage:
- Called immediately after login or signup
- Used to redirect users to required onboarding steps
`,
	})
	@ApiOkResponse({
		description: 'User onboarding status retrieved successfully',
		type: OnboardingStatusDto,
	})
	@ApiUnauthorizedResponse({
		description: 'User is not authenticated',
	})
	async checkOnboardingStatus(
		@GetUser('id') userId: Types.ObjectId,
	) {
		const result = await this.userService.isOnboardingComplete(userId);
		return ResponseHelper.success(result, HttpStatus.OK);
	}


	@UseGuards(AuthGuard)
	@Delete('me')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Delete current user account',
		description:
			'Deletes the authenticated user account. Requires a valid access token in the Authorization header.',
	})
	@ApiResponse({
		status: 200,
		description: 'User account successfully deleted',
		schema: {
			example: {
				data: {
					message: 'User deleted',
				},
				statusCode: 200,
				error: null,
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized – invalid or missing access token',
		schema: {
			example: {
				data: null,
				statusCode: 401,
				error: {
					message: 'Invalid token',
				},
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'User not found',
		schema: {
			example: {
				data: null,
				statusCode: 404,
				error: {
					message: 'User not found',
				},
			},
		},
	})
	async removeMe(@GetUser('id') id: Types.ObjectId) {
		const response = await this.userService.delete(id);
		return ResponseHelper.success({ message: "User deleted" }, HttpStatus.OK)
	}
}
