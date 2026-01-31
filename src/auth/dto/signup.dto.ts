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
  
  @ApiProperty({ example: "student" })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}