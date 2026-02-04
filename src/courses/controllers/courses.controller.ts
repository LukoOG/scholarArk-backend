import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards, UploadedFile, UseInterceptors, HttpStatus, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiQuery, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiOkResponse, ApiConsumes } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { CacheInterceptor } from '@nestjs/cache-manager';

import { CourseQueryDto } from '../dto/courses/course-filter.dto';
import { CourseFullContentResponseDto } from '../dto/courses/course-full-content.dto';

import { ResponseHelper } from '../../common/helpers/api-response.helper';
import { Types } from 'mongoose';
import { CoursesService } from '../services/courses.service';
import { CreateCourseDto, CreateLessonDto, TestDTO } from '../dto/courses/create-course.dto';
import { UpdateCourseDto } from '../dto/courses/update-course.dto';
import { Course } from '../schemas/course.schema';

import { GetUser, Roles } from '../../common/decorators'
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CourseAccessGuard, CourseOwnerGuard } from '../guards/course.guard';
import { RolesGuard } from 'src/common/guards';
import { UserRole } from 'src/common/enums';
import { CourseOutlineDto } from '../dto/courses/course-outline.dto';
import { UploadLessonDto, UploadLessonResponseDto } from '../dto/courses/upload-course.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/multer/multer.config';
import { CoursesDemoService } from '../services/courses.demo.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { plainToInstance } from 'class-transformer';
import { CreateCourseMultipartDto } from '../dto/courses/create-course-multipart.dto';

@ApiTags('Courses')
@ApiBearerAuth('access-token')
@Controller('courses')
export class CoursesController {
	constructor(
		private readonly coursesService: CoursesService,
		private readonly demo: CoursesDemoService,
		private readonly cloud: CloudinaryService
	) { }

	@Post()
	@UseGuards(AuthGuard, RolesGuard)
	@Roles(UserRole.TUTOR)
	@ApiOperation({ summary: 'Create a new course' })
	@ApiBearerAuth()
	@ApiResponse({ status: 201, description: 'Course created successfully', type: Course })
	@ApiResponse({ status: 400, description: 'Invalid request body' })
	async create(@Body() createCourseDto: CreateCourseDto, @GetUser('id') tutorId: Types.ObjectId) {
		const { courseId } = await this.coursesService.create(createCourseDto, tutorId);
		return ResponseHelper.success({ "message": "Course created successfully", courseId })
	}

	@Patch(':courseId/publish')
	@UseGuards(AuthGuard, RolesGuard, CourseOwnerGuard)
	@Roles(UserRole.TUTOR)
	@ApiOperation({
		summary: "Publish a Course",
		description: `
Publishes a course and makes it publicly visible and purchasable.

Validation checks:
- Course has at least one module
- Course has at least one lesson
- Course has valid pricing
`,
	})
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'Course published successfully' })
	async publishCourse(@Param('courseId') courseId: Types.ObjectId, @GetUser('id') tutorId: Types.ObjectId) {
		const response = await this.coursesService.publishCourse(courseId, tutorId)
		return ResponseHelper.success(response, HttpStatus.OK)
	}

	@Post(':courseId/:lessonId/publish')
	@UseGuards(AuthGuard, RolesGuard, CourseOwnerGuard)
	@Roles(UserRole.TUTOR)
	async publishLesson(
		@Param('courseId') courseId: Types.ObjectId,
		@GetUser('id') tutorId: Types.ObjectId,
		@Param('lessonId') lessonId: Types.ObjectId
	) {
		const response = await this.coursesService.publishLesson(courseId, lessonId, tutorId)
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
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get recommended courses',
		description: 'Returns a list of recommended courses for the authenticated user',
	})
	@ApiOkResponse({
		description: 'Recommended courses retrieved successfully',
		type: [Course],
	})
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	async recommended(@GetUser('id') userId: Types.ObjectId) {
		const result = await this.coursesService.getRecommended(userId);
		return ResponseHelper.success(result)
	}

	@Get('me/enrolled')
	@UseGuards(AuthGuard)
	@ApiOperation({
		summary: 'Get enrolled courses',
		description: 'Returns all courses the authenticated user is enrolled in',
	})
	@ApiOkResponse({
		description: 'Enrolled courses retrieved successfully',
		type: [Course],
	})
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	async enrolled(@GetUser('id') userId: Types.ObjectId) {
		const result = await this.coursesService.getEnrolledCourses(userId)
		return ResponseHelper.success(result)
	}

	@Get('me/tutor')
	@UseGuards(AuthGuard, RolesGuard)
	@Roles(UserRole.TUTOR)
	@ApiOperation({
		summary: 'Get tutor-owned courses',
		description: 'Returns all courses created by the authenticated tutor',
	})
	@ApiOkResponse({
		description: 'Tutor-owned courses retrieved successfully',
		type: [Course],
	})
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'User is not a tutor' })
	async tutor(@GetUser('id') tutorId: Types.ObjectId) {
		const result = await this.coursesService.getTutorOwnedCourses(tutorId)
		return ResponseHelper.success(result)
	}

	@Get(':tutorId/tutor')
	@UseGuards(AuthGuard)
	@ApiOperation({
		summary: 'Get tutor-owned courses by their Id',
		description: 'Returns all courses created by the authenticated tutor',
	})
	@ApiParam({
		name: 'tutorId',
		example: "695b897dcc20e8a0c87c70ed",
		description: "Id of tutor whose courses are needed"
	})
	@ApiOkResponse({
		description: 'Tutor-owned courses retrieved successfully',
		type: [Course],
	})
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'User is not a tutor' })
	async tutorById(@Param('tutorId') tutorId: Types.ObjectId) {
		const result = await this.coursesService.getTutorOwnedCoursesById(tutorId)
		return ResponseHelper.success(result)
	}

	//public access point
	@Get(':courseId')
	@ApiOperation({ summary: 'Get a Course by ID' })
	@ApiParam({ name: 'courseId', example: '695e6f462e8bbe31fdc07411', description: 'MongoDB ObjectId of the course' })
	@ApiResponse({ status: 200, description: 'Returns a specific course', type: Course })
	@ApiResponse({ status: 404, description: 'Course not found' })
	async findOne(@Param('courseId') id: string) {
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
	async getCourseOutline(@Param('courseId') courseId: Types.ObjectId) {
		const response = await this.coursesService.getOutline(courseId)
		return ResponseHelper.success(response)
	}

	@Patch(':courseId')
	@ApiOperation({ summary: 'Update a course by ID' })
	@ApiParam({ name: 'courseId', example: '68f17f0f6f0740d2d0bb6be3' })
	@ApiResponse({ status: 200, description: 'Course updated successfully', type: Course })
	@ApiResponse({ status: 404, description: 'Course not found' })
	async update(@Param('courseId') id: string, @Body() updateCourseDto: UpdateCourseDto) {
		const result = await this.coursesService.update(id, updateCourseDto);
		return ResponseHelper.success(result)
	}

	@Delete(':courseId')
	@ApiOperation({ summary: 'Delete a course by ID' })
	@ApiParam({ name: 'courseId', example: '68f17f0f6f0740d2d0bb6be3' })
	@ApiResponse({ status: 200, description: 'Course deleted successfully' })
	@ApiResponse({ status: 404, description: 'Course not found' })
	async remove(@Param('courseId') id: string) {
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
	async getCourseContent(@Param('courseId') courseId: Types.ObjectId) {
		const content = await this.coursesService.getFullContent(courseId)
		return ResponseHelper.success(content, HttpStatus.OK)
	}

	@Post('demo')
	@UseGuards(AuthGuard, RolesGuard)
	@Roles(UserRole.TUTOR)
	@ApiBearerAuth()
	@ApiConsumes('multipart/form-data')
	@ApiOperation({
		summary: 'Create demo course with lesson media',
		description:
			'Creates a course in draft mode and uploads lesson videos asynchronously. ' +
			'The request uses multipart/form-data with a stringified JSON payload and video files. ' +
			'Video processing does not block course creation.' +
			'Lesson videos are uploaded and processed asynchronously. ' +
			'Course creation does not wait for video processing to complete.',
	})
	@ApiBody({
		description:
			'Multipart request containing course JSON and lesson media files. ' +
			'Each lesson.mediaKey must match the original filename of its video.',
		type: CreateCourseMultipartDto,
	})
	@ApiResponse({
		status: 201,
		description: 'Course drafted successfully',
		schema: {
			example: {
				success: true,
				message: 'Course drafted successfully',
				data: {
					courseId: '65f1a9c9b7c9a5f3a12e9c01',
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid request payload or missing lesson media',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden – Tutor role required',
	})
	@UseInterceptors(FilesInterceptor('files', 10, multerConfig))
	async create2(@Body("json") createCourseDto: string, @GetUser('id') tutorId: Types.ObjectId, @UploadedFiles() files?: Express.Multer.File[]) {
		// const parsed = JSON.parse(createCourseDto)
		// const dto = plainToInstance(CreateCourseDto, parsed)

		// const fileMap = new Map<string, Express.Multer.File>();
		// files.forEach(file => fileMap.set(file.originalname, file));

		// const { courseId, lessons } = await this.demo.create(dto, tutorId)

		// for (const lesson of lessons) {
		// 	if (!lesson.key) continue;

		// 	let file = fileMap.get(lesson.key);
		// 	console.log(fileMap)
		// 	if (!file) continue

		// 	this.cloud.uploadVideo(
		// 		file,
		// 		lesson.id,
		// 	)
		// }

		// return ResponseHelper.success({ "message": "Course drafted successfully", courseId }, HttpStatus.CREATED)
		return ResponseHelper.error({ message: "Endpoint is restricted" }, HttpStatus.FORBIDDEN)
	}
}
//TODO
//move play lesson and upload lesson to lesson service
