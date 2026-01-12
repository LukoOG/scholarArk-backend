import { Controller, Post, Get, Patch, Delete, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiBody, ApiBearerAuth, ApiResponse, ApiOperation } from "@nestjs/swagger";

@ApiTags('Modules')
@Controller('modules')
export class ModulesController {
    constructor (){}
}