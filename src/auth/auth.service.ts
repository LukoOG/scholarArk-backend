import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../user/schemas/user.schema'
import { UserRole } from '../common/enums';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async validateUserFromToken(token: string): Promise<{ id: Types.ObjectId, role: UserRole }> {
    const payload = await this.jwtService.verifyAsync(token);

    if (!isValidObjectId(payload.sub) || payload.typ !== 'user') {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userModel
      .findById(payload.sub)
      .select('_id role')
      .lean()
      .exec();

    if (!user) throw new UnauthorizedException('User not found');

    return {
		id: user._id,
		role: user.role,
	}
  }
}

