import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GoogleClientService } from '../common/services/google.service';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config'
import { Model, HydratedDocument } from 'mongoose';
import { User } from './schemas/user.schema';
import { SignupDto, CompleteSignupDto } from './dto/signup.dto';
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
	  public userModel: Model<User>, 
	  private readonly jwtService: JwtService,
	  private readonly configService: ConfigService<Config>,
	  private readonly googleClient: GoogleClientService,
	) {}
  
  private async generateTokens(user: HydratedDocument<User>){
	const payload = {
		sub: user._id.toString(),
		//username: user.username,
		name: user.fullName,
		role: user.role,
		typ: 'user', 
	};

	const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
	const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

	await this.storeRefreshToken(user._id.toString(), refreshToken);

	return { accessToken, refreshToken };
  }

  async register(signupDto: SignupDto): Promise<{ user: Omit<User, 'password'>, accessToken: string, refreshToken: string }> {
	let user = await this.userModel
      .findOne({
        $or: [
          { 'email.value': signupDto.email?.value },
        ],
      })
      .exec();

    if (user) throw new UserAlreadyExistsException();
	const { password: plainPassword, ...rest } = signupDto; 
    
	const hashedPassword = await bcrypt.hash(plainPassword, 10)
	
	const createdUser = new this.userModel({
		...rest,
		password: hashedPassword,
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
	
	async loginWithGoogle(idToken: string){
		const payload = await this.googleClient.verifyIdToken(idToken)
		
		const { sub, email, name } = payload;
		
		let user = await this.userModel.findOne({ googleId: sub }).exec();
		
		if(!user){
			//client sends more fields other than id-token based on need
			user = await this.userModel.create({
				email: { value: email, verified: true },
				//username: name,
				first_name: name,
				googleId: sub,
				authProvider: "google",
			})
		}
		
		return this.generateTokens(user)
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

	async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
	  const {
		goalIds,
		topicIds,
		preferenceIds,
		...profileData
	  } = updateUserDto;

	  const user = await this.userModel.findById(id).exec();
	  if (!user) throw new UserNotFoundException();

	  // 1. Apply profile updates
	  Object.assign(user, profileData);

	  // 2. Apply preferences/goals/topics
	  if (goalIds) user.goals = goalIds.map(id => new Types.ObjectId(id));
	  if (topicIds) user.topics = topicIds.map(id => new Types.ObjectId(id));
	  if (preferenceIds) user.preferences = preferenceIds.map(id => new Types.ObjectId(id));

	  // 3. Mark completion flags
	  if (Object.keys(profileData).length > 0) {
		user.isProfileComplete = true;
	  }

	  if (goalIds || topicIds || preferenceIds) {
		user.isPreferencesComplete = true;
	  }

	  await user.save();
	  return user;
	}


  async delete(id: string): Promise<void> {
    const res = await this.userModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('User not found');
  }
}
