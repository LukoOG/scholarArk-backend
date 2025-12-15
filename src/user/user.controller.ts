import { Controller, Get, Post, Body, Param, Delete, Patch, Query, HttpCode, HttpStatus, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/multer/multer.config';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiBearerAuth, ApiCreatedResponse, ApiBadRequestResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { SignupDto, OauthSignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseHelper } from '../common/helpers/api-response.helper';
import { GetUser } from '../common/decorators'
import { UserGuard } from '../user/user.guard';
import { Types } from 'mongoose';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  
  @Post('register')
  @UseInterceptors(FileInterceptor('profile_pic', multerConfig))
  @ApiOperation({ summary: 'Register a new user' })
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
  async register(@Body() signupDto: SignupDto, @UploadedFile() file?: Express.Multer.File) {
	  const user = await this.userService.register(signupDto, file);
	  return ResponseHelper.success(user, HttpStatus.CREATED)
  }
  
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and get JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    schema: {
      example: {
		data:{
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
    const user = await this.userService.login(loginDto);
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
  async refresh(@Body('refreshToken') refreshToken: string ){
	const tokens = await this.userService.refreshTokens(refreshToken);
	return ResponseHelper.success(tokens)
  }
  
  @Post('/google')
  @HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login/Register using Google OAuth token' })
	@ApiBody({ type: OauthSignupDto })
	@ApiOkResponse({
	  description: 'User logged in via Google OAuth',
	  schema: {
		example: {
		  data: {
					  user: {
          _id: '6730a8cfb8c2a12b4e9b25cd',
          username: 'emmanuel',
          email: { value: 'emma@test.com', verified: true },
          role: 'STUDENT',
        },
			accessToken: 'eyJHkip143InR5...',
			refreshToken: 'eyJHkip143InR5...',
		  },
		},
	  },
	})
	@ApiUnauthorizedResponse({
	  description: 'Invalid Google token',
	  schema: {
		example: {
		  statusCode: 401,
		  message: 'Invalid Google ID token',
		  error: 'Unauthorized',
		},
	  },
	})
  async googleOauth(@Body() dto: OauthSignupDto ){
	const tokens = await this.userService.loginWithGoogle(dto)
	return ResponseHelper.success(tokens)
  }

  @Get()
  async findAll(@Query('role') role?: 'student' | 'tutor') {
    const response = await this.userService.findAll(role);
	return ResponseHelper.success(response)	
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
   const response = await this.userService.findOne(id);
	return ResponseHelper.success(response)   
  }
  
  @UseGuards(UserGuard)
  @Get('me')
  async findOneMe(@GetUser('id') id: string) {
   const response = await this.userService.findOne(id);
	return ResponseHelper.success(response)   
  }
  
  @UseGuards(UserGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('profile_pic', multerConfig))
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
  async updateMe(@GetUser('id') id: Types.ObjectId, @Body() updateUserDto: UpdateUserDto, @UploadedFile() file?: Express.Multer.File) {
    const response = await this.userService.update(id, updateUserDto, file);
	return ResponseHelper.success(response)	
  }
  
  @UseGuards(UserGuard)
  @Delete('me')
  @ApiBearerAuth()
  async removeMe(@GetUser('id') id: Types.ObjectId) {
    const response = await this.userService.delete(id);
	return ResponseHelper.success({ message :"User deleted" }, HttpStatus.OK)
  }
}
