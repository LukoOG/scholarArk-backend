import { Controller, Post, Get, Patch, Delete, UseGuards, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiBody, ApiBearerAuth, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { CourseOwnerGuard } from "../guards/course.guard";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { LessonsService } from "../services";
import { ResponseHelper } from "src/common/helpers/api-response.helper";

@ApiTags('Lessons')
@Controller()
@UseGuards(AuthGuard, CourseOwnerGuard)
export class LessonsController {
    constructor (
        lessonsService: LessonsService
    ){}

    @Post('/courses/:courseId/modules')
    createModule(){

    }

    @Patch(':lessonId')
    updateModule(){

    }

    @Delete(':lessonId')
    deleteModule(){

    }

    @Post(':/reorder')
    reorderLessons(){

    }
}