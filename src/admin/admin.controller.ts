import { Body, Controller, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Types } from 'mongoose';
import { VerifyTutorDto } from './dto/verification.dto';
import { RolesGuard } from 'src/common/guards';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser, Roles } from 'src/common/decorators';
import { UserRole } from 'src/common/enums';

@UseGuards(AuthGuard, RolesGuard, ThrottlerGuard)
@Roles(UserRole.ADMIN)
@Controller('/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // warning: remove route in production
  @Post('/signup')
  signup(@Body() body: SignupDto) {
    return this.adminService.signup(body);
  }

  @Post('/login')
  login(@Body() body: LoginDto) {
    return this.adminService.login(body);
  }

  @Post('verify-tutor/:tutorId')
  async verifyTutor(@Param('tutorId') tutorId: Types.ObjectId, @Body() dto: VerifyTutorDto, @GetUser('id') adminId: Types.ObjectId){
    return this.adminService.verifyTutor(tutorId, dto, adminId)
  }
}
