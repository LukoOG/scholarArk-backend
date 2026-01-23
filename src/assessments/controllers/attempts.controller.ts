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

  @Post('assessments/:assessmentId/attempts/start')
  start(
    @Param('assessmentId') assessmentId: Types.ObjectId,
    @GetUser('id') studentId: Types.ObjectId,
  ) {
    return this.attemptsService.startAttempt(
      assessmentId,
      studentId,
    );
  }

  @Post('assessments/:assessmentId/attempts/submit')
  submit(
    @Param('assessmentId') assessmentId: Types.ObjectId,
    @GetUser('id') studentId: Types.ObjectId,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.attemptsService.submitAttempt(
      assessmentId,
      studentId,
      dto,
    );
  }

  @Get('attempts/:attemptId/result')
  getResult(@Param('attemptId') id: Types.ObjectId, @GetUser('id') studentId: Types.ObjectId,) {
    return this.attemptsService.getResult(id, studentId);
  }
}
