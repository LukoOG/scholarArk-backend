import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { CacheInterceptor } from '@nestjs/cache-manager';

import { PaginationDto } from '../common/dto/pagination.dto';
import { CourseFilterDto } from './dto/course-filter.dto';

import { ResponseHelper } from '../common/helpers/api-response.helper';
import { Types } from 'mongoose';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './schemas/courses.schema';
import { Request } from 'express';

import { GetUser } from '../common/decorators'
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Courses') 
@ApiBearerAuth('access-token')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully', type: Course })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() createCourseDto: CreateCourseDto, @GetUser('id') userId: Types.ObjectId) { 
    const result = await this.coursesService.create(createCourseDto, userId);
	return ResponseHelper.success(result)
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
	@ApiResponse({
	  status: 200,
	  description: 'Courses fetched successfully',
	})
  @ApiResponse({ status: 200, description: 'List of all courses', type: [Course] })
  async findAll(@Query() pagination: PaginationDto, @Query() filters: CourseFilterDto ) {
    const result = await this.coursesService.findAll(pagination, filters);
	return ResponseHelper.success(result)
  }

  @Get('recommended')
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: 'List of all courses', type: [Course] })
  async recommended(@GetUser('id') userId: Types.ObjectId) {
    const result = await this.coursesService.getRecommended(userId);
	return ResponseHelper.success(result)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiParam({ name: 'id', example: '68f17f0f6f0740d2d0bb6be3', description: 'MongoDB ObjectId of the course' })
  @ApiResponse({ status: 200, description: 'Returns a specific course', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string) {
    const result = await this.coursesService.findOne(id);
	return ResponseHelper.success(result)
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
}
