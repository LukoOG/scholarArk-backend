import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './schemas/admin.schema';
import { Model, Types } from 'mongoose';
import { AdminMethods } from './schemas/methods';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { VerificationEnum, VerifyTutorDto } from './dto/verification.dto';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { UserRole } from 'src/common/enums';
import { TutorVerificationStatus } from 'src/user/schemas/sub-schema/tutor.sub';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name)
    readonly adminModel: Model<Admin, object, AdminMethods>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) { }

  async signup(dto: SignupDto) {
    if (await this.adminModel.findOne({ username: dto.username }).exec())
      throw new BadRequestException({ message: 'Admin already exists.' });

    const admin = await this.adminModel.create(dto);

    const token = await this.jwtService.signAsync({
      sub: admin.id,
      typ: 'admin',
    });

    return { message: 'Admin signup successful!', data: { admin, token } };
  }

  async login(dto: LoginDto) {
    const { username, password } = dto;

    const admin = await this.adminModel.findOne({ username }).exec();

    if (!admin || !(await admin.verifyHash('password', password)))
      throw new BadRequestException('Invalid credentials!');

    const token = await this.jwtService.signAsync({
      sub: admin.id,
      typ: 'admin',
    });

    return { message: 'Admin login successful!', data: { admin, token } };
  }

  async verifyTutor(
    tutorId: Types.ObjectId,
    dto: VerifyTutorDto,
    adminId: Types.ObjectId,
  ) {
    const tutor = await this.userModel.findById(tutorId).exec();

    if (!tutor) {
      throw new NotFoundException('Tutor not found');
    }

    if (tutor.role !== UserRole.TUTOR) {
      throw new BadRequestException('User is not a tutor');
    }

    if (
      dto.status === TutorVerificationStatus.REJECTED &&
      !dto.rejectionReason
    ) {
      throw new BadRequestException(
        'Rejection reason is required when rejecting a tutor',
      );
    }

    tutor.tutorVerification = {
      status: dto.status,
      verifiedAt: new Date(),
      verifiedBy: adminId,
      rejectionReason:
        dto.status === TutorVerificationStatus.REJECTED
          ? dto.rejectionReason
          : undefined,
    };

    await tutor.save();

    return {
      message: `Tutor ${dto.status.toLowerCase()} successfully`,
    };
  }

}
