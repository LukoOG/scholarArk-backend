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
import { User, UserDocument, UserListItem } from './schemas/user.schema';
import { UserFcmToken, UserFcmTokenDocument } from './schemas/user-fcm-token.schema';
import { UserRole } from '../common/enums';
import {
	UserAlreadyExistsException,
	UserNotFoundException,
} from './exceptions';
import * as bcrypt from 'bcrypt';
import { MediaService } from 'src/common/services/media.service';
import { MediaProvider } from 'src/common/schemas/media.schema';
import { UserQueryDto } from './dto/get-users.dto';
import { PaginatedResponse } from 'src/common/interfaces';

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

	private isMetaComplete(user: Partial<User>): boolean {
		return user?.topicsIds.length > 0 && user?.goalsIds.length > 0 && user?.preferencesIds.length > 0
	}

	async updateSubscribedTutors(userId: Types.ObjectId, tutorId: Types.ObjectId): Promise<void> {
		const result = await this.userModel.findByIdAndUpdate(
			userId,
			{ $push: { subscribedTutorIds: tutorId } },
			{ runValidators: true }
		)
	}

	async findAll(roleDto: UserQueryDto): Promise<PaginatedResponse<UserListItem>> {
		const { page = 1, limit = 20, role } = roleDto;

		const skip = (page - 1) * limit;

		const query: any = {};

		if (role) {
			query.role = role;
		}

		const [items, total] = await Promise.all([
			this.userModel
				.find(query)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit),

			this.userModel.countDocuments(query)
		]);

		return {
			items,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total/limit),
				hasNextPage: page * limit < total
			}
		}
	}

	async findOne(id: Types.ObjectId): Promise<User> {
		const user = await this.userModel.findById(id).exec();
		if (!user) throw new NotFoundException('User not found');
		return user.toJSON()
	}

	async update(id: Types.ObjectId, updateUserDto: UpdateUserDto): Promise<User> {

		//console.log(id)
		const {
			goalIds,
			topicIds,
			preferenceIds,
			profile_pic,
			...profileData
		} = updateUserDto;

		// Build the update object
		const updatePayload: any = {
			...profileData,
		};

		if (goalIds) updatePayload.goalsIds = goalIds.map(id => new Types.ObjectId(id));
		if (topicIds) updatePayload.topicsIds = topicIds.map(id => new Types.ObjectId(id));
		if (preferenceIds) updatePayload.preferencesIds = preferenceIds.map(id => new Types.ObjectId(id))

		// Perform atomic update
		console.log(updatePayload)
		const updatedUser = await this.userModel.findByIdAndUpdate(
			id,
			{ $set: updatePayload },
			{ new: true, runValidators: true },
		).exec();

		if (!updatedUser) throw new UserNotFoundException();

		if (profile_pic) {
			updatedUser.profile_pic = {
				key: profile_pic.s3key,
				size: profile_pic.size,
				mimeType: profile_pic.mimeType,
				provider: MediaProvider.S3,
			}

			await updatedUser.save()
		};

		const isProfileComplete = this.isProfileComplete(updatedUser);

		if (updatedUser.onboardingStatus.isProfileComplete !== isProfileComplete) {
			updatedUser.onboardingStatus.isProfileComplete = isProfileComplete;
			await updatedUser.save()
		};

		const isMetaComplete = this.isMetaComplete(updatedUser);

		if (updatedUser.onboardingStatus.isMetaComplete !== isMetaComplete) {
			updatedUser.onboardingStatus.isMetaComplete = isMetaComplete;
			await updatedUser.save()
		};
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

	async isOnboardingComplete(userId: Types.ObjectId) {
		const user = await this.userModel.findById(userId).lean().exec();
		if (!user) throw new UserNotFoundException();

		const status = user.onboardingStatus;

		return status;
	}

	async delete(id: Types.ObjectId): Promise<void> {
		const res = await this.userModel.findByIdAndDelete(id).exec();
		if (!res) throw new NotFoundException('User not found');
	}
}
