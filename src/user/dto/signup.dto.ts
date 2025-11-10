import { Type } from 'class-transformer'
import { ValidateNested, IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsEmail, IsStrongPassword } from 'class-validator';
import { Gender, UserRole } from 'src/common/enums';

export class EmailDto {
  @IsEmail()
  value: string;

  @IsBoolean()
  verified: boolean;
}

export class SignupDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailDto)
  email?: EmailDto;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  highest_qualification?: string;

  @IsOptional()
  @IsString()
  profile_pic?: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword(
		{ minLength: 8, minSymbols: 0 },
		{ message: "Password must be at least 8 characters long" },
	)
  password?: string;
}
