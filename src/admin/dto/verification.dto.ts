import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { TutorVerificationStatus } from "src/user/schemas/sub-schema/tutor.sub";


export enum VerificationEnum {
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export class VerifyTutorDto {
  @IsEnum(TutorVerificationStatus)
  status: TutorVerificationStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
