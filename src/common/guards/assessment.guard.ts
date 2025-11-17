import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class AssessmentOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(Assessment.name) private assessmentModel: Model<Assessment>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;               
    const assessmentId = req.params.id;   

    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Assessment not found');

    if (assessment.createdBy.toString() !== user.id.toString())
      throw new ForbiddenException('You do not own this assessment');

    return true;
  }
}
