import { Controller, Get, Post, Body, Param, Delete, Patch, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseHelper } from '../common/helpers/api-response.helper';
import { GetUser } from '../common/decorators'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User Created Successfully',
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
  async register(@Body() signupDto: SignupDto) {
    const user = await this.userService.register(signupDto);
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
  @ApiOperation({ summary: "Refresh user tokens after access token expiry" })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({
	  status: 200,
	  description: "tokens refreshed",
	  schema: {
		  example: {
			data:{
			  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5...',
			  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5...', 
			}
		  }
	  },
  })
  async refresh(@Body('refreshToken') refreshToken: string ){
	const tokens = await this.userService.refreshTokens(refreshToken);
	return ResponseHelper.success(tokens)
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
	const tokens = await this.userService.loginWithGoogle(token)
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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const response = await this.userService.update(id, updateUserDto);
	return ResponseHelper.success(response)	
  }
  
  @Patch('me')
  async updateMe(@GetUser('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const response = await this.userService.update(id, updateUserDto);
	return ResponseHelper.success(response)	
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const response = await this.userService.delete(id);
	return ResponseHelper.success({ message :"User deleted" }, HttpStatus.OK)
  }
}
