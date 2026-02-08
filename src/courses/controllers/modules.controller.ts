import { Controller, Body, Param, Post, Patch, Delete, UseGuards, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiBody, ApiParam, ApiBearerAuth, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { CourseOwnerGuard } from "../guards/course.guard";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { ModulesService } from "../services";
import { Types } from "mongoose";
import { ResponseHelper } from "src/common/helpers/api-response.helper";
import { GetUser, Roles } from "src/common/decorators";
import { CreateModuleDto } from "../dto/modules/create-module.dto";
import { RolesGuard } from "src/common/guards";
import { UserRole } from "src/common/enums";

@ApiTags('Modules')
@Controller("modules")
@UseGuards(AuthGuard, CourseOwnerGuard, RolesGuard)
@Roles(UserRole.TUTOR)
export class ModulesController {
    constructor(
        private readonly modulesService: ModulesService
    ) { }

    @Post(':courseId')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create a module in a course',
        description: `
Adds a new module to a draft course.
- Only the course tutor can perform this action
- Published courses cannot be modified
- Lessons are created together with the module
`,
    })
    @ApiParam({
        name: 'courseId',
        description: 'The ID of the course to which the module will be added',
        example: '695bbc7f050dceb9e3202e22',
    })
    @ApiBody({
        type: CreateModuleDto,
        description: 'Module details along with its lessons',
    })
    @ApiResponse({
        status: 201,
        description: 'Module created successfully',
        schema: {
            example: {
                success: true,
                data: {
                    moduleId: '6960a6e25adbb2fd3c4f9a11',
                },
                message: 'Module created successfully',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid request or course cannot be modified',
        schema: {
            example: {
                statusCode: 400,
                message: 'Cannot edit published course',
                error: 'Bad Request',
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiResponse({
        status: 403,
        description: 'User is not the tutor of this course',
    })
    async addModule(@Param('courseId') courseId: Types.ObjectId, @GetUser('id') tutorId: Types.ObjectId, @Body() dto: CreateModuleDto) {
        const result = await this.modulesService.addModule(courseId, tutorId, dto)
        return ResponseHelper.success(result, HttpStatus.CREATED)
    }

    @Patch(':moduleId')
    async updateModule() {

    }

    @Delete(':moduleId')
    async deleteModule() {

    }

    @Post(':courseId/reorder')
    async reorderModules() {

    }
}