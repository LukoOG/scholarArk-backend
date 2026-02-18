import { ApiProperty } from "@nestjs/swagger";
import { Gender, UserRole } from "src/common/enums";

export class UserListItemDto {
  @ApiProperty({ type: [String] })
  completedCourseIds: string[];

  @ApiProperty({ type: [String] })
  subscribedTutorIds: string[];

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  birthday: string;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  profilePicUrl: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ type: [String] })
  topicsIds: string[];

  @ApiProperty({ type: [String] })
  preferenceIds: string[];

  @ApiProperty({ type: [String] })
  goalsIds: string[];
}


export class UserListResponseDto {
  @ApiProperty({ type: [UserListItemDto] })
  data: UserListItemDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;
}

export class UserDetailResponseDto extends UserListItemDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  onboardingStatus: {
    hasAcceptedTerms: boolean;
    isProfileComplete: boolean;
    isMetaComplete: boolean;
    isOnboardingComplete: boolean;
  };
}
