import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { isValidObjectId, Types } from 'mongoose';
import { UserNotFoundException } from '../../user/exceptions';

export type UserPopulatedRequest = Request & { user: { id: Types.ObjectId } };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) throw new BadRequestException('Authorization token missing!');

	const { id, role } = await this.authService.validateUserFromToken(token)

    request['user'] = { id: id, role: role };

    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
