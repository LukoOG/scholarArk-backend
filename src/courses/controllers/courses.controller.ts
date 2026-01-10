import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards, UploadedFile, UseInterceptors, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { CacheInterceptor } from '@nestjs/cache-manager';

import { CourseQueryDto } from '../dto/course-filter.dto';
import { CourseFullContentResponseDto } from '../dto/course-full-content.dto';

import { ResponseHelper } from '../../common/helpers/api-response.helper';
import { Types } from 'mongoose';
import { CoursesService } from '../services/courses.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { Course } from '../schemas/course.schema';

import { GetUser, Roles } from '../../common/decorators'
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CourseAccessGuard } from '../guards/course.guard';
import { RolesGuard } from 'src/common/guards';
import { UserRole } from 'src/common/enums';
import { CourseOutlineDto } from '../dto/course-outline.dto';

@ApiTags('Courses') 
@ApiBearerAuth('access-token')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.TUTOR)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Course created successfully', type: Course })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() createCourseDto: CreateCourseDto, @GetUser('id') tutorId: Types.ObjectId) { 
    await this.coursesService.create(createCourseDto, tutorId);
	return ResponseHelper.success({"message":"Course created successfully"})
  }

  @Post(':courseId/publish')
  @UseGuards(AuthGuard, RolesGuard, CourseAccessGuard)
  @Roles(UserRole.TUTOR)
  @ApiOperation({ 
	summary: "Publish a Course",
	description: `
Publishes a course and makes it publicly visible and purchasable.

Validation checks:
- Course has at least one module
- Course has at least one lesson
- Course has valid pricing
`,})
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Course published successfully' })
  async publishCourse(@Param('courseId') courseId: Types.ObjectId, @GetUser('id') tutorId: Types.ObjectId){
	const response = await this.coursesService.publishCourse(courseId, tutorId)
	return ResponseHelper.success(response, HttpStatus.OK)
  }

  @Get()
  @ApiOperation({
	  summary: 'Get all courses',
	  description: `
		Returns a paginated list of courses.

		Supports filtering by:
		- topics
		- goals
		- course level
		- search keyword

		This endpoint is **public** and does not require authentication.
		Results are paginated to improve performance and support infinite scrolling on mobile.
		`,
	})
	@ApiQuery({
	  name: 'topicIds',
	  required: false,
	  description: 'Filter by topic IDs',
	  example: ['64f17f0f6f0740d2d0bb6be3'],
	})
	@ApiQuery({
	  name: 'goalIds',
	  required: false,
	  description: 'Filter by goal IDs',
	  example: ['64f17f0f6f0740d2d0bb6be3'],
	})
	@ApiQuery({
	  name: 'level',
	  required: false,
	  enum: ['Beginner', 'Intermediate', 'Advanced'],//CourseLevel,
	  example: 'Beginner',
	})
	@ApiQuery({
	  name: 'search',
	  required: false,
	  description: 'Search keyword (matches title or description)',
	  example: 'javascript',
	})
	@ApiQuery({
	  name: 'page',
	  required: false,
	  description: 'page of the pagination',
	  example: '1',
	})
	@ApiQuery({
	  name: 'limit',
	  required: false,
	  description: 'how much data should be returned per request',
	  example: '10',
	})
	@ApiResponse({
	  status: 200,
	  description: 'Courses fetched successfully',
	})
  @ApiResponse({ status: 200, description: 'List of all courses', type: [Course] })
  async findAll(@Query() query: CourseQueryDto) {
	  console.log('query', query)
	const result = await this.coursesService.findAll(query);
	return ResponseHelper.success(result)
  }

  @Get('recommended')
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: 'List of all courses', type: [Course] })
  async recommended(@GetUser('id') userId: Types.ObjectId) {
    const result = await this.coursesService.getRecommended(userId);
	return ResponseHelper.success(result)
  }

  //public access point
  @Get(':id')
  @ApiOperation({ summary: 'Get a Course by ID' })
  @ApiParam({ name: 'id', example: '695e6f462e8bbe31fdc07411', description: 'MongoDB ObjectId of the course' })
  @ApiResponse({ status: 200, description: 'Returns a specific course', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string) {
    const result = await this.coursesService.findOne(id);
	return ResponseHelper.success(result)
  }

  @Get(':courseId/outline')
	@ApiOperation({
	summary: 'Get course outline',
	description: `
	Returns the public outline of a published course.

	Includes:
	- Modules
	- Lesson titles
	- Durations
	- Preview flags

	Does NOT include:
	- Lesson content
	- Video URLs
	- Full learning material
	`,
	})
	@ApiParam({
	name: 'courseId',
	type: 'string',
	description: 'Course ID',
	example: '695e6f462e8bbe31fdc07411',
	})
	@ApiResponse({
	status: 200,
	description: 'Course outline retrieved successfully',
	type: CourseOutlineDto,
	})
	@ApiResponse({
	status: 404,
	description: 'Course not found or not published',
	})
  async getCourseOutline(@Param('courseId') courseId: Types.ObjectId){
	const response = await this.coursesService.getOutline(courseId)
	return ResponseHelper.success(response)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course by ID' })
  @ApiParam({ name: 'id', example: '68f17f0f6f0740d2d0bb6be3' })
  @ApiResponse({ status: 200, description: 'Course updated successfully', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    const result = await this.coursesService.update(id, updateCourseDto);
	return ResponseHelper.success(result)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course by ID' })
  @ApiParam({ name: 'id', example: '68f17f0f6f0740d2d0bb6be3' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(@Param('id') id: string) {
    await this.coursesService.remove(id);
	return ResponseHelper.success({ message: "Course deleted" })
  }
  
  @Get(':courseId/content')
	@ApiBearerAuth()
	@ApiOperation({
	summary: 'Get full course content',
	description: `
	Returns the full course structure including modules and lessons.
	Only accessible to:
	- Enrolled students
	- Course tutor
	`,
	})
	@ApiParam({
	name: 'courseId',
	description: 'MongoDB ObjectId of the course',
	example: '695e6f462e8bbe31fdc07411',
	})
	@ApiResponse({
	status: 200,
	description: 'Full course content',
	type: CourseFullContentResponseDto,
	})
	@ApiResponse({
	status: 401,
	description: 'Unauthorized',
	})
	@ApiResponse({
	status: 403,
	description: 'User is not enrolled in this course',
	})
	@ApiResponse({
	status: 404,
	description: 'Course not found',
	})
  @UseGuards(AuthGuard, CourseAccessGuard)
  async getCourseContent(@Param('courseId') courseId: Types.ObjectId){
	const content = await this.coursesService.getFullContent(courseId)
	return ResponseHelper.success(content, HttpStatus.OK)
  }

	@Get(':lessonId/play')
	@UseGuards(AuthGuard, CourseAccessGuard)
	@ApiBearerAuth()
	@ApiOperation({
	summary: 'Get secure playback URL for lesson video',
	})
	@ApiParam({
	name: 'lessonId',
	example: '695c4a483443b575a0086ce5',
	})
	@ApiResponse({
	status: 200,
	description: 'Signed playback URL',
	})
	async playLesson(
	@Param('lessonId') lessonId: Types.ObjectId,
	) {
	const result = await this.coursesService.getPlaybackUrl(lessonId);

	return ResponseHelper.success(result, HttpStatus.OK);
	}

}

  //learning
  /**
GET /courses/:courseId/content - done
GET /courses/:courseId/modules
GET /courses/:courseId/modules/:moduleId/lessons
GET /lessons/:lessonId
  **/
  
