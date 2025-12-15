import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { isValidObjectId, Types } from 'mongoose';
import { UserNotFoundException } from './exceptions';

export type UserPopulatedRequest = Request & { user: { id: Types.ObjectId } };

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token)
      throw new BadRequestException({ message: 'Token not present!' });

	const user = await this.authService.validateUserFromToken(token)

    if (!user) throw new UserNotFoundException();

    request['user'] = { id: user._id, role: user.role };

    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
