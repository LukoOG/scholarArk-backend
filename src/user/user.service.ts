import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GoogleClientService } from '../common/services/google.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config'
import { Model, HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SignupDto, OauthSignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from './exceptions';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
	  @InjectModel(User.name) 
	  public userModel: Model<UserDocument>, 
	  private readonly jwtService: JwtService,
	  private readonly configService: ConfigService<Config>,
	  private readonly googleClient: GoogleClientService,
	  private readonly cloudinaryService: CloudinaryService,
	) {}
  
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
		profile_pic: profilePicUrl
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
	
	async loginWithGoogle(dto: OauthSignupDto){
		const { token: idToken, role = UserRole.STUDENT } = dto;
		
		const payload = await this.googleClient.verifyIdToken(idToken)
		
		
		if (!payload?.email) {
		  throw new BadRequestException(
			'Google account has no accessible email. Ensure email scope is granted.',
		  );
		}
		
		const { sub, email, name, picture } = payload;
		console.log(payload)
		
		let user = await this.userModel.findOne({ googleId: sub }).exec();
		
		if(user) throw new UserNotFoundException();
		
		const createdUser = await this.userModel.create({
				email: { value: email, verified: true },
				first_name: name,
				role,
				profile_pic: picture,
				googleId: sub,
				authProvider: "google",
			});
			
		
		const { accessToken, refreshToken } = await this.generateTokens(createdUser);
		
		const { refresh_token, ...userWithoutSecrets } = createdUser.toObject();
		
		return { user: userWithoutSecrets, accessToken, refreshToken }
	}

  async findAll(role?: 'student' | 'tutor'): Promise<User[]> {
    if (role) return this.userModel.find({ role }).exec();
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

	async update(id: Types.ObjectId, updateUserDto: UpdateUserDto, file): Promise<User> {
		let profilePicUrl: string | undefined
		
		if(file){
			let profilePicUrl = await this.cloudinaryService.uploadImage(file, 'users/profile-pics')
		};
		
		//console.log(id)
	  const {
		goalIds,
		topicIds,
		preferenceIds,
		...profileData
	  } = updateUserDto;

	  // Build the update object
	  const updatePayload: any = {
		...profileData,
		profilee_pic: profilePicUrl
	  };

	  if (goalIds) updatePayload.goals = goalIds.map(id => new Types.ObjectId(id));
	  if (topicIds) updatePayload.topics = topicIds.map(id => new Types.ObjectId(id));
	  if (preferenceIds) updatePayload.preferences = preferenceIds.map(id => new Types.ObjectId(id));

	  // Set completion flags
	  if (Object.keys(profileData).length > 0) updatePayload.isProfileComplete = true;
	  if (goalIds || topicIds || preferenceIds) updatePayload.isPreferencesComplete = true;

	  // Perform atomic update
	  const updatedUser = await this.userModel.findByIdAndUpdate(
		id,
		{ $set: updatePayload },
		{ new: true, runValidators: true },
	  ).exec();

	  if (!updatedUser) throw new UserNotFoundException();
	  
	  const { password, refresh_token, ...userWithoutSecrets } = updatedUser.toObject();

	  return updatedUser;
	}

  async delete(id: Types.ObjectId): Promise<void> {
    const res = await this.userModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('User not found');
  }
}
