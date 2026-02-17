import { Type } from 'class-transformer'
import { ValidateNested, IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsEmail, IsStrongPassword, IsMongoId } from 'class-validator';
import { Gender, UserRole } from 'src/common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @IsEmail()
  @IsString()
  value: string;

  @IsBoolean()
  verified: boolean;
}

export class SignupDto {
  // @ApiProperty({ example: { value: 'user@example.com', verified: false } })
  // @ValidateNested()
  // @Type(() => EmailDto)
  // email: EmailDto;
  @ApiProperty({ example: "user@example.com" })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword(
		{ minLength: 8, minSymbols: 1, minUppercase: 1, minNumbers: 1 },
		{ message: `
      Password must be at least 8 characters long, \n contain at least 1 symbol, \n 1 number and \n 1 Uppercase character
      ` },
	)
  password: string;
  
  @ApiProperty({ example: "student" })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}