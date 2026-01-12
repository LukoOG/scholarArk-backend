import { Controller, Post, Param, Patch, Delete, UseGuards, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiBody, ApiParam, ApiBearerAuth, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { CourseOwnerGuard } from "../guards/course.guard";
import { AuthGuard } from "@nestjs/passport";
import { ModulesService } from "../services";
import { Types } from "mongoose";
import { ResponseHelper } from "src/common/helpers/api-response.helper";
import { GetUser } from "src/common/decorators";
import { CreateModuleDto } from "../dto/courses/create-course.dto";

@ApiTags('Modules')
@Controller()
@UseGuards(AuthGuard, CourseOwnerGuard)
export class ModulesController {
    constructor(
        private readonly modulesService: ModulesService
    ) { }

    @Post('courses/:courseId/modules')
    @ApiOperation({
        summary: 'Create a module in a course',
        description: 'Allows a tutor to add a new module to a draft course',
    })
    @ApiParam({
        name: 'courseId',
        description: 'Course ID',
        example: '695bbc7f050dceb9e3202e22',
    })
    @ApiResponse({
        status: 201,
        description: 'Module created successfully',
    })
    createModule(@Param('courseId') courseId: Types.ObjectId, @GetUser('id') userId: Types.ObjectId, @Body() dto: CreateModuleDto) {
        const result = await this.modulesService
        return ResponseHelper.success(result, HttpStatus.CREATED)
    }

    @Patch('modules/:moduleId')
    updateModule() {

    }

    @Delete('modules/:moduleId')
    deleteModule() {

    }

    @Post('courses/:courseId/modules/reorder')
    reorderModules() {

    }
}