import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { GoogleClientService } from '../common/services/google.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../user/schemas/user.schema'
import { UserRole } from '../common/enums';
import { Types, HydratedDocument } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { OauthDto } from './dto/oauth.dto';
import { LoginDto } from './dto/login.dto';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../user/exceptions';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

const defaultAuthProviders = {
  local: false,
  google: false,
  apple: false,
  facebook: false,
} as const;


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
	private readonly googleClient: GoogleClientService,
	private readonly cloudinaryService: CloudinaryService,
  ) {}

  async validateUserFromToken(token: string): Promise<{ id: Types.ObjectId, role: UserRole }> {
	try{
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
	}catch(error){
		if(error instanceof TokenExpiredError || error?.name === 'TokenExpiredError'){
			console.error(error)
			throw new UnauthorizedException('Token Expired')
		};
		
		if(error instanceof JsonWebTokenError || error?.name === 'JsonWebTokenError'){
			throw new UnauthorizedException('Invalid Token')
		};
	};
  }
  
    private async generateTokens(user: HydratedDocument<User>){
	const payload = {
		sub: user._id.toString(),
		name: user.fullName,
		email: user.email.value,
		role: user.role,
		typ: 'user', 
	};

	const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
	const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

	await this.storeRefreshToken(user._id.toString(), refreshToken);

	return { accessToken, refreshToken };
  }

  async register(signupDto: SignupDto, file?: Express.Multer.File): Promise<{ user: Omit<User, 'password'>, accessToken: string, refreshToken: string }> {
	let profilePicUrl: string | undefined;
	
	if(file){
		profilePicUrl = await this.cloudinaryService.uploadImage(file, 'users/profile-pics')
	};
	
	let user = await this.userModel
      .findOne({
        $or: [
          { 'email.value': signupDto.email?.value },
        ],
      })
      .exec();

    if (user) throw new UserAlreadyExistsException();
	const { role = UserRole.STUDENT, password: plainPassword, ...rest } = signupDto; 
    
	const hashedPassword = await bcrypt.hash(plainPassword, 10)
	
	const createdUser = new this.userModel({
		...rest,
		password: hashedPassword,
		profile_pic: profilePicUrl,
		authProviders: { ...defaultAuthProviders, local: true }
	});
	
    const savedUser = await createdUser.save();
	
	const { accessToken, refreshToken } = await this.generateTokens(savedUser);
	
	const { password, refresh_token, ...userWithoutSecrets } = savedUser.toObject();
	
	return { user: userWithoutSecrets, accessToken, refreshToken }
  }
  
  async login(loginDto: LoginDto): Promise<{ user: Omit<User, 'password'>, accessToken: string, refreshToken: string }>{
	const { email, password: plainPassword } = loginDto;
	
	const user = await this.userModel.findOne({ 'email.value': email }).exec();
	
	if(!user) throw new UnauthorizedException('Invalid credentials');
	
	
	const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');
	
	if (!user.authProviders.local) {
	  throw new BadRequestException(
		'Account was created using Google. Please sign in with Google.',
	  );
	}

	
	const { accessToken, refreshToken } = await this.generateTokens(user);
	
	const { password, refresh_token, ...userWithoutSecrets } = user.toObject();
	return { user: userWithoutSecrets, accessToken, refreshToken }
	
  }
  
  async storeRefreshToken(userId: string, refreshToken: string) {
	  const hashed = await bcrypt.hash(refreshToken, 10);
	  await this.userModel.updateOne(
		{ _id: userId },
		{ $set: { refresh_token: hashed } },
	  );
	}
	
	async validateRefreshToken(userId: string, refreshToken: string) {
	  const user = await this.userModel.findById(userId).exec();
	  if (!user || !user.refresh_token) throw new UnauthorizedException();

	  const isValid = await bcrypt.compare(refreshToken, user.refresh_token);
	  if (!isValid) throw new UnauthorizedException();

	  return user;
	}
	
	//service for the endpoint to refresh both access and refresh token
	async refreshTokens(refreshToken: string) {
	  let payload: any;

	  try {
		payload = await this.jwtService.verifyAsync(refreshToken);
		if (payload.typ !== 'user') throw new Error();
	  } catch {
		throw new UnauthorizedException('Invalid refresh token');
	  }

	  const user = await this.validateRefreshToken(payload.sub, refreshToken);

	  return this.generateTokens(user);
	}
	
	async loginWithGoogle(dto: OauthDto){
		const { token: idToken, role = UserRole.STUDENT } = dto;
		
		const payload = await this.googleClient.verifyIdToken(idToken)
		
		
		if (!payload?.email) {
		  throw new BadRequestException(
			'Google account has no accessible email. Ensure email scope is granted.',
		  );
		}
		
		const { sub: googleId, email, email_verified, name, picture } = payload;
		console.log(payload)
		
		let user = await this.userModel.findOne({
			$or: [
				{ googleId },
				{ 'email.value': email },
			],
		});
		
		if(user){
			if(!user.googleId){
				user.authProviders ??= defaultAuthProviders
				user.googleId = googleId;
				user.authProviders.google = true;
				user.email.verified ||= email_verified;
				user.profile_pic ||= picture;
				await user.save();
			};
			
			const tokens = await this.generateTokens(user);
		
			const { refresh_token, ...safeUser } = user.toObject();
			
			return { user: safeUser, ...tokens };			
		};
		
		const createdUser = await this.userModel.create({
				email: { value: email, verified: email_verified },
				first_name: name,
				role,
				profile_pic: picture,
				googleId,
				authProviders: { ...defaultAuthProviders, google: true }
			});
			
		
		const tokens = await this.generateTokens(createdUser);
		
		const { refresh_token, ...safeUser } = createdUser.toObject();
		
		return { user: safeUser, ...tokens }
	}
	
	async sendResetLink(email: string){
		const user = await this.userModel.findOne({ email: email }).exec();
		
		if(!user) throw new ForbiddenException();
		
		const rawToken = randomBytes(32).toString('hex');
		const hashedToken = createHash('256').update(rawToken).digest('hex');
		
		user.passwordResetToken = hashedToken;
		user.passwordResetExpires = new Date(Date.now() + (15 * 60 * 1000) )

		await user.save();
	}
	
	async resetPassword(token: string, password: string){
		const hashed = createHash('256').update(token).digest('hex');
		
		const user = await this.userModel.findOne({
			passwordResetToken: hashed,
			passWordResetExpires: { $gt: new Date() },
		}).exec();
		
		if(!user) throw new BadRequestException('Invalid or expired reset link');
		
		user.password = await bcrypt.hash(password, 12);
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		
		await user.save();
	}
}

