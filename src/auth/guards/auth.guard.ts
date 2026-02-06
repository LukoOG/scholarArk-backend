import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { Types } from 'mongoose';
import { UserRole } from 'src/common/enums';

export type UserPopulatedRequest = Request & { user: { id: Types.ObjectId, role: UserRole, email: string } };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    readonly authService: AuthService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) throw new BadRequestException('Authorization token missing!');

    const { id, role, email } = await this.authService.validateUserFromToken(token)

    request['user'] = { id: id, role: role, email: email };

    return true;
  }

  public extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class OptionalAuthGuard extends AuthGuard {
  constructor(
    authService: AuthService
  ) {
    super(authService)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      request['user'] = null;
      return true
    }

    const { id, role, email } = await this.authService.validateUserFromToken(token)

    request['user'] = { id: id, role: role, email: email };

    return true;
  }
}
