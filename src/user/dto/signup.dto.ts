/*
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';
import { EmailValidator, TitleValidator } from 'src/common/decorators';
import { Gender } from 'src/common/enums';
import { UsernameRegex } from 'src/common/regex';

/**
 * All fields are made optional by default.
 * Modify to suit the app's requirements.

export class SignupDto {
  @Matches(UsernameRegex)
  @IsOptional()
  username?: string;

  @TitleValidator()
  @IsOptional()
  'name.first'?: string;

  @TitleValidator()
  @IsOptional()
  'name.last'?: string;

  @EmailValidator()
  @IsOptional()
  'email.value'?: string;

  @IsPhoneNumber()
  @IsOptional()
  'phone.value'?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsStrongPassword()
  @IsOptional()
  password?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  birthday?: Date;
}
*/
import { Type } from 'class-transformer'
import { ValidateNested, IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsEmail } from 'class-validator';
import { Gender } from 'src/common/enums';
import { Email } from 'src/common/schemas';

export class SignupDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;
  
  @ValidateNested()
  @Type(() => Email)
  email?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @IsOptional()
  @IsBoolean()
  isTutor?: boolean;

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
  password?: string;
}
