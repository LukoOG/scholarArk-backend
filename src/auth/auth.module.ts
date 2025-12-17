import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { MailModule } from 'src/mail/mail.module';
import { GoogleClientService } from '../common/services/google.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		CloudinaryModule,
		MailModule
	],
  providers: [AuthService, AuthGuard, GoogleClientService],
  exports: [AuthService, AuthGuard],
  controllers: [AuthController]
})
export class AuthModule {}
