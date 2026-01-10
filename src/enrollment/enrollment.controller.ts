import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from '../common/decorators'
import { Types } from 'mongoose';
import { ResponseHelper } from '../common/helpers/api-response.helper';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}
  
  //not to be exposed
  @ApiOperation({ summary: "Don't integrate. Not for Frontend" })
  @UseGuards(AuthGuard)
  @Post('manual/:courseId')
  async enroll(@GetUser('id') userId: Types.ObjectId, @Param('courseId') courseId: Types.ObjectId){
	const response = await this.enrollmentService.enroll(userId, courseId)
	return ResponseHelper.success(response, HttpStatus.CREATED)
  }
}
