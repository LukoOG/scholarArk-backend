import { IsStrongPassword } from 'class-validator';
import { EmailValidator } from 'src/common/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @EmailValidator()
  email: string;

  @ApiProperty()
  @IsStrongPassword(
  		{ minLength: 8, minSymbols: 0 },
		{ message: "Password must be at least 8 characters long" },
	)
  password: string;
}
