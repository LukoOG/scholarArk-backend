/*
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { FilterQuery, Model, Types } from 'mongoose';
import * as crypto from 'node:crypto';

import { User } from './schemas/user.schema';
import { UserMethods } from './schemas/methods';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GetUsersDto } from './dto/get-users.dto';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from './exceptions';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name)
    readonly userModel: Model<User, object, UserMethods, { fullName: string }>,
    private readonly jwtService: JwtService,
  ) { }

  // note: write admin module first
  async getAllUsers() { }

  async getUsers(dto: GetUsersDto) {
    const { q } = dto;

    const filter: FilterQuery<User> = {};

    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { 'name.first': { $regex: q, $options: 'i' } },
        { 'name.last': { $regex: q, $options: 'i' } },
      ];
    }

    const users = await this.userModel
      .find(filter)
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return { message: 'Users fetched.', data: { users } };
  }

  async signup(dto: SignupDto) {
    let user = await this.userModel
      .findOne({
        $or: [
          { username: dto.username },
          { 'email.value': dto['email.value'] },
        ],
      })
      .exec();

    if (user) throw new UserAlreadyExistsException();

    user = await this.userModel.create(dto);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      typ: 'user',
    });

    return { message: 'User signup successful!', data: { user, token } };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ 'email.value': dto.email })
      .exec();

    if (!user || !(await user.verifyHash('password', dto.password)))
      throw new BadRequestException({ message: 'Invalid credentials!' });

    const token = await this.jwtService.signAsync({
      sub: user.id,
      typ: 'user',
    });

    return { message: 'User login successful!', data: { user, token } };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const { email, otp } = dto;

    const user = await this.userModel.findOne({ 'email.value': email }).exec();

    if (!user) throw new UserNotFoundException();

    if (user.get('email.verified'))
      throw new BadRequestException({ message: 'Email already verified.' });

    const isValid = await user.verifyNonce(otp);

    if (isValid === 'expired')
      throw new BadRequestException({ message: 'OTP has expired.' });

    if (!isValid) throw new BadRequestException({ message: 'OTP is invalid' });

    user.set('email.verified', true);
    await user.save();

    return { message: 'Email verified!' };
  }

  async getUserProfile(userId: Types.ObjectId) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean()
      .exec();

    return { message: 'User profile fetched!', data: { user } };
  }

  async updateUser(userId: Types.ObjectId, dto: UpdateUserDto) {
    if (
      dto['username'] &&
      (await this.userModel.findOne({ username: dto['username'] }).exec())
    )
      throw new UserAlreadyExistsException();

    const result = await this.userModel
      .updateOne({ _id: userId }, { $set: dto })
      .exec();

    if (result.matchedCount < 1) throw new UserNotFoundException();

    return { message: 'User updated!' };
  }

  async upload(userId: Types.ObjectId, files: Express.Multer.File[]) {
    if (files.length === 0)
      throw new BadRequestException('No files were sent.');

    const urls: string[] = [];

    for (const file of files) {
      const key = crypto.randomUUID().toString();

    }

    return { message: 'Files Uploaded Successful!', data: { urls } };
  }

  async deleteProfile(userId: Types.ObjectId, dto) { }
}
*/

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/environment-variables'
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
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
	  private readonly configService: ConfigService<EnvironmentVariables>,
	) {}
  
  private async generateTokens(user: User){
	const payload = {
		sub: user._id.toString(),
		username: user.username,
		role: user.role,
		typ: 'user', 
	};

	const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
	const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

	await this.storeRefreshToken(user._id.toString(), refreshToken);

	return { accessToken, refreshToken };
  }

  async create(signupDto: SignupDto): Promise<{ user: Omit<User, 'password'>, accessToken: string, refreshToken: string }> {
	let user = await this.userModel
      .findOne({
        $or: [
          { username: signupDto.username },
          { 'email.value': signupDto.email?.value },
        ],
      })
      .exec();

    if (user) throw new UserAlreadyExistsException();
	const { role = UserRole.STUDENT, password: plainPassword, ...rest } = signupDto; //Ensures default role is default if no role is provided
    
	const hashedPassword = await bcrypt.hash(plainPassword, 10)
	
	const createdUser = new this.userModel({
		...rest,
		password: hashedPassword,
		role
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
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
	
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
		const ticket = await this.googleClient.verifyIdToken({
			idToken,
			audience: configService.get('GOOGLE_CLIENT_ID'),
		})
		
		const payload = ticket.getPayload();
		const { sub, email, name } = payload;
		
		let user = await this.userModel.findOne({ googleId: sub }).exec();
		
		if(!user){
			user = await this.userModel.create({
				email: { value: email, verified: true },
				username: name,
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
    const updated = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.userModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('User not found');
  }
}
