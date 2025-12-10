import { Type } from 'class-transformer'
import { ValidateNested, IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsEmail, IsStrongPassword, IsMongoId } from 'class-validator';
import { Gender, UserRole } from 'src/common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @IsEmail()
  value: string;

  @IsBoolean()
  verified: boolean;
}

export class SignupDto {
  @ApiProperty({ example: { value: 'user@example.com', verified: false } })
  @ValidateNested()
  @Type(() => EmailDto)
  email: EmailDto;


  @ApiProperty()
  @IsString()
  @IsStrongPassword(
		{ minLength: 8, minSymbols: 0 },
		{ message: "Password must be at least 8 characters long" },
	)
  password: string;
}

export class CompleteSignupDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  last_name?: string;
  
  @ApiProperty()
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @ApiProperty()
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  highest_qualification?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  profile_pic?: string;	
  
  @ApiProperty()
  @IsOptional()
  
}