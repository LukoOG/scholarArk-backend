import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';
import { GoogleClientService } from '../common/services/google.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config'
import { Model, HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
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
	  private readonly cloudinaryService: CloudinaryService,
	) {}

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
			profilePicUrl = await this.cloudinaryService.uploadImage(file, 'users/profile-pics');
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
		profile_pic: profilePicUrl
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
