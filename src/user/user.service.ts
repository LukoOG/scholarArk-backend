import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';
import { SaveFcmTokenDto } from './dto/save-fcm-token.dto';
import { GoogleClientService } from '../common/services/google.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config'
import { Model, HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserFcmToken, UserFcmTokenDocument } from './schemas/user-fcm-token.schema';
import { UserRole } from '../common/enums';
import {
	UserAlreadyExistsException,
	UserNotFoundException,
} from './exceptions';
import * as bcrypt from 'bcrypt';
import { MediaService } from 'src/common/services/media.service';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) public userModel: Model<UserDocument>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<Config>,
		private readonly cloudinaryService: CloudinaryService,
		private readonly mediaService: MediaService,
		@InjectModel(UserFcmToken.name) private fcmTokenModel: Model<UserFcmTokenDocument>
	) { }

	private isProfileComplete(user: Partial<User>): boolean {
		const requiredFields = [
			user.first_name,
			user.last_name,
			user.profile_pic,
			user.email,
		]

		return requiredFields.every((field) => field !== undefined && field !== null || field !== '')
	}

	private isMetaComplete(user: Partial<User>): boolean{
		return user?.topicsIds.length > 0 && user?.goalsIds.length > 0 && user?.preferencesIds.length > 0
	}

	async updateSubscribedTutors(userId: Types.ObjectId, tutorId: Types.ObjectId): Promise<void> {
		const result = await this.userModel.findByIdAndUpdate(
			userId,
			{
				subscribedTutorIds: { $push: tutorId }
			})
	}

	async findAll(role?: 'student' | 'tutor'): Promise<User[]> {
		if (role) return this.userModel.find({ role }).exec();
		return this.userModel.find().exec();
	}

	async findOne(id: Types.ObjectId): Promise<User> {
		const user = await this.userModel.findById(id).exec();
		if (!user) throw new NotFoundException('User not found');
		return user.toJSON();
	}

	async update(id: Types.ObjectId, updateUserDto: UpdateUserDto): Promise<User> {

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
		};

		if (goalIds) updatePayload.goalsIds = goalIds.map(id => new Types.ObjectId(id));
		if (topicIds) updatePayload.topicsIds = topicIds.map(id => new Types.ObjectId(id));
		if (preferenceIds) updatePayload.preferencesIds = preferenceIds.map(id => new Types.ObjectId(id) )

		// Perform atomic update
		console.log(updatePayload)
		const updatedUser = await this.userModel.findByIdAndUpdate(
			id,
			{ $set: updatePayload },
			{ new: true, runValidators: true },
		).exec();

		if (!updatedUser) throw new UserNotFoundException();

		const isProfileComplete = this.isProfileComplete(updatedUser);

		if (updatedUser.onboardingStatus.isProfileComplete !== isProfileComplete) {
			updatedUser.onboardingStatus.isProfileComplete = isProfileComplete;
			await updatedUser.save()
		};

		const isMetaComplete = this.isMetaComplete(updatedUser);

		if(updatedUser.onboardingStatus.isMetaComplete !== isMetaComplete){
			updatedUser.onboardingStatus.isMetaComplete = isMetaComplete;
			await updatedUser.save()
		};

		const { password, refresh_token, ...userWithoutSecrets } = updatedUser.toObject();

		return updatedUser;
	}

	async saveFcmToken(
		userId: Types.ObjectId,
		dto: SaveFcmTokenDto,
	) {
		const { fcmToken, device, remindersEnabled } = dto;

		// 1. Upsert device token
		await this.fcmTokenModel.findOneAndUpdate(
			{ token: fcmToken },
			{
				userId,
				token: fcmToken,
				device,
				isActive: true,
				lastSeenAt: new Date(),
			},
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
			},
		);

		// 2. Optionally update user preferences
		if (typeof remindersEnabled === 'boolean') {
			await this.userModel.findByIdAndUpdate(userId, {
				remindersEnabled,
			});
		}
	}

	async acceptTerms(userId: Types.ObjectId) {
		return await this.userModel.findByIdAndUpdate(
			userId,
			{
				$set: {
					'onboardingStatus.hasAcceptedTerms': true,
					'onboardingStatus.termsAcceptedAt': new Date(),
				}
			},
			{ new: true }
		)
	}

	async completeOnboarding(userId: Types.ObjectId) {
		const user = await this.userModel.findById(userId).lean().exec();
		if (!user) throw new UserNotFoundException();

		console.log(user.onboardingStatus)

		if (!user.onboardingStatus.hasAcceptedTerms) {
			throw new BadRequestException('Terms not accepted');
		}

		if (!user.onboardingStatus.isProfileComplete) {
			throw new BadRequestException('Profile incomplete');
		}

		if (!user.onboardingStatus.isMetaComplete) {
			throw new BadRequestException('Topics, Goals and Preferences incomplete');
		}

		return this.userModel.findByIdAndUpdate(
			userId,
			{ isOnboardingComplete: true },
			{ new: true }
		);
	}

	async isOnboardingComplete(userId: Types.ObjectId){
		const user = await this.userModel.findById(userId).lean().exec();
		if(!user) throw new UserNotFoundException();

		const status = user.onboardingStatus;

		return status;
	}

	async delete(id: Types.ObjectId): Promise<void> {
		const res = await this.userModel.findByIdAndDelete(id).exec();
		if (!res) throw new NotFoundException('User not found');
	}
}
