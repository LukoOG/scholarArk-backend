import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assessment } from './schemas/assessments.schema';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

@Injectable()
export class AssessmentOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(Assessment.name) private assessmentModel: Model<Assessment>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;               
    const assessmentId = req.params.assessmentId;   

    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Assessment not found');

    if (assessment.createdBy.toString() !== user.id.toString())
      throw new ForbiddenException('You do not own this assessment');

    return true;
  }
}
