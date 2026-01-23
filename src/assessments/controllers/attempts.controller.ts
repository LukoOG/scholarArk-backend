import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AttemptsService } from '../services/attempts.service';
import { SubmitAttemptDto } from '../dto/attempts/attempt.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators';
import { ResponseHelper } from 'src/common/helpers/api-response.helper';
import { Types } from 'mongoose';

@ApiTags('Assessment Attempts')
@UseGuards(AuthGuard)
@Controller()
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post('assessments/:id/attempts/start')
  start(
    @Param('id') assessmentId: string,
    @GetUser('id') studentId: Types.ObjectId,
  ) {
    return this.attemptsService.startAttempt(
      assessmentId,
      studentId,
    );
  }

  @Post('assessments/:id/attempts/submit')
  submit(
    @Param('id') assessmentId: string,
    @GetUser('id') studentId: Types.ObjectId,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.attemptsService.submitAttempt(
      assessmentId,
      studentId,
      dto,
    );
  }

  @Get('attempts/:id/result')
  getResult(@Param('id') id: string, @GetUser('id') studentId: Types.ObjectId,) {
    return this.attemptsService.getResult(id, studentId);
  }
}
