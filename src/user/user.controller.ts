/*
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserGuard, UserPopulatedRequest } from './user.guard';
import { Types } from 'mongoose';
import { ObjectId } from 'src/common/decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(@Query() query: GetUsersDto) {
    return this.userService.getUsers(query);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/signup')
  signup(@Body() body: SignupDto) {
    return this.userService.signup(body);
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  login(@Body() body: LoginDto) {
    return this.userService.login(body);
  }

  @UseGuards(UserGuard)
  @Get('/me')
  getUserProfile(@Req() req: UserPopulatedRequest) {
    return this.userService.getUserProfile(req.user.id);
  }

  @UseGuards(UserGuard)
  @Patch('/me')
  updateUser(@Req() req: UserPopulatedRequest, @Body() body: UpdateUserDto) {
    return this.userService.updateUser(req.user.id, body);
  }

  @UseGuards(ThrottlerGuard)
  @Get('/verify-email')
  verifyEmail(@Query() query: VerifyEmailDto) {
    return this.userService.verifyEmail(query);
  }

  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(UserGuard, ThrottlerGuard)
  @Post('/upload')
  upload(
    @Req() req: UserPopulatedRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.userService.upload(req.user.id, files);
  }
}
*/

import { Controller, Get, Post, Body, Param, Delete, Patch, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseHelper } from '../common/helpers/api-response.helper';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
	status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        user: {
          _id: '6730a8cfb8c2a12b4e9b25cd',
          username: 'emmanuel',
          email: { value: 'emma@test.com', verified: true },
          role: 'STUDENT',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
      },
    },
  })
  async create(@Body() signupDto: SignupDto) {
    const user = await this.userService.create(signupDto);
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
        user: {
          _id: '6730a8cfb8c2a12b4e9b25cd',
          username: 'emmanuel',
          email: { value: 'emma@test.com', verified: true },
          role: 'STUDENT',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.userService.login(loginDto);
	return ResponseHelper.success(user)
  }
  
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh user tokens after access token expiry" })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({
	  status: 200,
	  description: "tokens refreshed",
	  schema: {
		  example: {
			  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
			  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5...',  
		  }
	  },
  })
  async refresh(@Body('refreshToken') refreshToken: string ){
	return this.userService.refreshTokens(refreshToken);
  }
  
  @Post('/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Endponit to Login/Register user via Google Oauth" })
  @ApiBody({ schema: { properties: { idToken: { type: 'string' } } } })
  @ApiResponse({
	  status: 200,
	  description: "User successfully logged in",
	  schema: {
		  example: {
			  accessToken: 'eyJHkip143InR5...',
			  refreshToken: 'eyJHkip143InR5...',
		  }
	  }
  })
  async googleOauth(@Body() token: string ){
	return this.userService.loginWithGoogle(token)
  }

  @Get()
  findAll(@Query('role') role?: 'student' | 'tutor') {
    return this.userService.findAll(role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
