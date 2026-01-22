import { Controller, Post, Get, Patch, Delete } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { QuestionsService } from "../services/question-bank.service";

@ApiTags("Questions")
@Controller()
export class QuestionBankController {
    constructor(
        private readonly questionsService: QuestionsService
    ){}

    @Get()
    async list(){}

    @Post()
    async create(){}

    @Post()
    async bulk(){}

    @Post()
    async generate(){

    }

    @Patch()
    async update(){}

    @Delete()
    async softDelete(){}
}