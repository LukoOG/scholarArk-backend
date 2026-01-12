import { Controller, Post, Get, Patch, Delete, UseGuards, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiBody, ApiBearerAuth, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { CourseOwnerGuard } from "../guards/course.guard";
import { AuthGuard } from "@nestjs/passport";
import { ModulesService } from "../services";
import { ResponseHelper } from "src/common/helpers/api-response.helper";

@ApiTags('Modules')
@Controller()
@UseGuards(AuthGuard, CourseOwnerGuard)
export class ModulesController {
    constructor (
        private readonly modulesService: ModulesService
    ){}

    @Post('courses/:courseId/modules')
    createModule(){

    }

    @Patch('modules/:moduleId')
    updateModule(){

    }

    @Delete('modules/:moduleId')
    deleteModule(){

    }

    @Post('courses/:courseId/modules/reorder')
    reorderModules(){
        
    }
}