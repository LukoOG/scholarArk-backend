import { Controller, Body, Param, Post, Patch, Delete, UseGuards, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiBody, ApiParam, ApiBearerAuth, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { CourseOwnerGuard } from "../guards/course.guard";
import { AuthGuard } from "@nestjs/passport";
import { ModulesService } from "../services";
import { Types } from "mongoose";
import { ResponseHelper } from "src/common/helpers/api-response.helper";
import { GetUser, Roles } from "src/common/decorators";
import { CreateModuleDto } from "../dto/courses/create-course.dto";
import { RolesGuard } from "src/common/guards";
import { UserRole } from "src/common/enums";

@ApiTags('Modules')
@Controller()
@UseGuards(AuthGuard, CourseOwnerGuard, RolesGuard)
@Roles(UserRole.TUTOR)
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
    async createModule(@Param('courseId') courseId: Types.ObjectId, @GetUser('id') tutorId: Types.ObjectId, @Body() dto: CreateModuleDto) {
        const result = await this.modulesService.createModule(courseId, tutorId, dto)
        return ResponseHelper.success(result, HttpStatus.CREATED)
    }

    @Patch('modules/:moduleId')
    async updateModule() {

    }

    @Delete('modules/:moduleId')
    async deleteModule() {

    }

    @Post('courses/:courseId/modules/reorder')
    async reorderModules() {

    }
}