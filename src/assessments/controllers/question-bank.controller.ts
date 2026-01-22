import { Controller, Post, Get, Patch, Delete } from "@nestjs/common";

@Controller()
export class QuestionBankController {
    constructor(

    ){}

    @Get()
    async list(){}

    @Post()
    async create(){}

    @Post()
    async bulk(){}

    @Post()
    async generate(){}

    @Patch()
    async update(){}

    @Delete()
    async softDelete(){}
}