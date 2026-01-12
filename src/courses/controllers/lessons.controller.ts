import { Controller, Post, Get, Patch, Delete, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiBody, ApiBearerAuth, ApiResponse, ApiOperation } from "@nestjs/swagger";

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
    constructor (){}
}