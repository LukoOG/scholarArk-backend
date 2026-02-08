import { Controller, UploadedFile, UseInterceptors, Post, Get, Body, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiQuery, ApiCreatedResponse, ApiBadRequestResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/multer/multer.config';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { SignupDto } from './dto/signup.dto';
import { OauthDto } from './dto/oauth.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { ResponseHelper } from '../common/helpers/api-response.helper';
import { GetUser } from '../common/decorators'
import { AuthGuard } from './guards/auth.guard';
import { Types, HydratedDocument } from 'mongoose';
import { AuthService } from './auth.service';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }
	@Post('register')
	@UseInterceptors(FileInterceptor('profile_pic', multerConfig))
	@ApiOperation({
		summary: 'Register using email and password',
		description: `
		Creates a new user using email & password.

		- Auth provider: local
		- Email verification handled separately
		`,
	})
	@ApiCreatedResponse({
		description: 'User created successfully',
		schema: {
			example: {
				data: {
					user: {
						_id: '6730a8cfb8c2a12b4e9b25cd',
						email: { value: 'emma@test.com', verified: false },
						role: 'STUDENT',
					},
					accessToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
					refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Validation failed or user already exists',
		schema: {
			example: {
				statusCode: 400,
				message: 'User already exists',
				error: 'Bad Request',
			},
		},
	})
	async register(@Body() signupDto: SignupDto) {
		const user = await this.authService.register(signupDto);
		return ResponseHelper.success(user, HttpStatus.CREATED)
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login user and get JWT token' })
	@ApiBody({ type: LoginDto })
	@ApiResponse({
		status: 200,
		description: 'Successful login',
		schema: {
			example: {
				data: {
					user: {
						_id: '6730a8cfb8c2a12b4e9b25cd',
						username: 'emmanuel',
						email: { value: 'emma@test.com', verified: true },
						role: 'STUDENT',
					},
					accessToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
					refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
				},
			}
		},
	})
	async login(@Body() loginDto: LoginDto) {
		const user = await this.authService.login(loginDto);
		return ResponseHelper.success(user)
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@ApiBody({
		schema: {
			properties: {
				refreshToken: { type: 'string' },
			},
			required: ['refreshToken'],
		},
	})
	@ApiOkResponse({
		description: 'Tokens refreshed successfully',
		schema: {
			example: {
				data: {
					accessToken: 'newAccessTokenHere...',
					refreshToken: 'newRefreshTokenHere...',
				},
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: 'Invalid or expired refresh token',
		schema: {
			example: {
				statusCode: 401,
				message: 'Invalid refresh token',
				error: 'Unauthorized',
			},
		},
	})
	async refresh(@Body('refreshToken') refreshToken: string) {
		const tokens = await this.authService.refreshTokens(refreshToken);
		return ResponseHelper.success(tokens)
	}

	@Post('/google')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Login or Register using Google OAuth',
		description: `
	This endpoint handles **both login and signup** using Google OAuth.

	### Behavior:
	- If the Google account is already linked → user is logged in
	- If the email exists (local account) → Google is linked
	- If user does not exist → new user is created

	### Notes:
	- Email permission must be granted
	- Role is only used on first signup
	`,
	})
	@ApiBody({ type: OauthDto })
	@ApiResponse({
		status: 200,
		description: 'User authenticated successfully',
		schema: {
			example: {
				data: {
					user: {
						_id: '6730a8cfb8c2a12b4e9b25cd',
						email: { value: 'emma@test.com', verified: true },
						role: 'STUDENT',
						authProviders: {
							local: false,
							google: true,
						},
					},
					accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
					refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
				},
			},
		},
	})
	async google(@Body() dto: OauthDto) {
		const result = await this.authService.loginWithGoogle(dto)
		return ResponseHelper.success(result)
	}

	@Get('verify-email')
	@ApiOperation({
		summary: 'Verify user email',
		description:
			'Verifies a user email using a one-time token sent to their email address.',
	})
	@ApiQuery({
		name: 'token',
		type: String,
		required: true,
		description: 'Email verification token sent via email',
		example: '431349',
	})
	@ApiOkResponse({
		description: 'Email verified successfully',
		schema: {
			example: {
				success: true,
				message: 'Email verified successfully',
				data: {
					message: 'Email verified successfully',
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Invalid or expired token',
		schema: {
			example: {
				success: false,
				message: 'Invalid or expired verification token',
				statusCode: 400,
			},
		},
	})
	async verifyEmail(@Query('token') token: string) {
		await this.authService.verifyEmail(token);
		return ResponseHelper.success({ message: "Email verified successfully" })
	}

	@Post('forgot-password')
	@ApiOperation({
		summary: "Request password reset link",
		description: `
		Sends a password reset link to the user's email address.
		If the email exists, a reset link is sent.
		If the email does not exist, the same success response is returned.
		This is intentional to prevent email enumeration attacks.
		`,
	})
	@ApiBody({ type: ForgotPasswordDto })
	async forgotPassword(@Body() dto: ForgotPasswordDto) {
		await this.authService.sendReset(dto.email)
		return ResponseHelper.success({ message: "reset link sent if email exists" })
	}

	@Post('reset-password')
	@ApiOperation({
		summary: "Reset user password",
		description: `
		Resets the user's password using a valid reset token.
		The token is obtained from the password reset email.
		`,
	})
	@ApiBody({ type: ResetPasswordDto })
	async resetPassword(@Body() dto: ResetPasswordDto) {
		await this.authService.resetPassword(dto.otp, dto.password)
		return ResponseHelper.success({ message: "Password Reset!" })
	}
}
