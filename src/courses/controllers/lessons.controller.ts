import { Controller, Post, Get, Patch, Delete, UseGuards, HttpStatus, Body, Param, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiBody, ApiBearerAuth, ApiResponse, ApiOperation, ApiConsumes, ApiParam } from "@nestjs/swagger";
import { CourseAccessGuard, CourseOwnerGuard } from "../guards/course.guard";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { LessonsService } from "../services";
import { ResponseHelper } from "src/common/helpers/api-response.helper";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { plainToInstance } from "class-transformer";
import { Types } from "mongoose";
import { Roles, GetUser } from "src/common/decorators";
import { UserRole } from "src/common/enums";
import { RolesGuard } from "src/common/guards";
import { multerConfig } from "src/common/multer/multer.config";
import { CreateCourseMultipartDto } from "../dto/courses/create-course-multipart.dto";
import { TestDTO, CreateCourseDto } from "../dto/courses/create-course.dto";
import { UploadLessonDto, UploadLessonResponseDto } from "../dto/courses/upload-course.dto";
import { CoursesDemoService } from "../services/courses.demo.service";

@ApiTags('Lessons')
@Controller('lessons')
@UseGuards(AuthGuard, CourseOwnerGuard)
export class LessonsController {
    constructor(
        private readonly lessonsService: LessonsService,
        private readonly demo: CoursesDemoService,
    ) { }
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.TUTOR)
    @Post(':courseId/:lessonId/upload-url')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get signed upload URL for lesson media',
        description: `
	Generates a temporary S3 upload URL for a lesson video.

	- Upload happens directly to S3
	- Backend does NOT receive the file
	- Must call completion endpoint after upload
	`,
    })
    @ApiParam({
        name: 'courseId',
        description: 'Course ID',
        example: '695bbc7f050dceb9e3202e22',
    })
    @ApiParam({
        name: 'lessonId',
        description: 'Lesson ID',
        example: '695c4a483443b575a0086ce5',
    })
    @ApiBody({ type: UploadLessonDto })
    @ApiResponse({
        status: 200,
        description: 'Signed upload URL generated',
        type: UploadLessonResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Not course owner' })
    @ApiResponse({ status: 404, description: 'Lesson not found' })
    async uploadLesson(
        @Param('lessonId') lessonId: Types.ObjectId,
        @Param('couseId') courseId: Types.ObjectId,
        @Body() dto: UploadLessonDto,
        @GetUser('id') tutorId: Types.ObjectId,
    ) {
        const result = await this.lessonsService.getUploadUrl(lessonId, courseId, tutorId, dto)
        return ResponseHelper.success(result)
    }

    @Get('/:lessonId/play')
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
        example: { url: "signed get url for lesson" }
    })
    async playLesson(
        @Param('lessonId') lessonId: Types.ObjectId,
    ) {
        const result = await this.lessonsService.getLessonUrl(lessonId);
        return ResponseHelper.success(result, HttpStatus.OK);
    }

    //demo
    @Post('test/video')
    @ApiOperation({
        summary: "Don't use this endpoint"
    })
    @UseInterceptors(FileInterceptor('video', multerConfig))
    async uploadVideo(@UploadedFile() file: Express.Multer.File, @Body() inpt: TestDTO) {
        console.log(inpt)
        console.log(inpt.module[0].id)
        console.log(inpt.module[0].lessons[0])
        console.log(inpt.module[0].lessons.length)


        // await this.lessonsService.uploadVideoToCloudinary(file)
        //return ResponseHelper.success({ "message": "video uploaded to cloudinary" })
        return ResponseHelper.error({ message: "Endpoint is restricted" }, HttpStatus.FORBIDDEN)
    }

    @Get('demo/:lessonId/play')
    @ApiOperation({
        // summary: 'Get demo media URLs for a lesson',
        // description:
        //     'Retrieves the Cloudinary MP4 and HLS URLs for a lesson’s demo media. ' +
        //     'The lesson must have been uploaded previously. Returns status and URLs.',
        summary: "Don't use this endpoint",
    })
    @ApiBearerAuth()
    @ApiParam({
        name: 'lessonId',
        type: 'string',
        description: 'The ObjectId of the lesson to retrieve media for',
        example: '65f1a9c9b7c9a5f3a12e9c01',
    })
    @ApiResponse({
        status: 200,
        description: 'Lesson demo media retrieved successfully',
        schema: {
            example: {
                success: true,
                message: 'Demo media retrieved',
                data: {
                    videoUrl: 'https://res.cloudinary.com/.../lesson.mp4',
                    hlsUrl: 'https://res.cloudinary.com/.../lesson.m3u8',
                    url: 'https://res.cloudinary.com/.../lesson.m3u8',
                    status: 'uploaded', // processing | uploaded | failed
                    publicId: 'demo-lessons/lesson.mp4',
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Lesson or demo media not found',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async getCloudinaryUrl(
        @Param('lessonId') lessonId: Types.ObjectId,
    ) {
        // const result = await this.demo.getCloudinaryUrls(lessonId);
        // return ResponseHelper.success(result);
        return ResponseHelper.error({ message: "Endpoint is restricted" }, HttpStatus.FORBIDDEN)
    }
}