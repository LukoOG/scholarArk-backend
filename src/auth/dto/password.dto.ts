import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: '456343',
  })
  @IsString()
  otp: string;

  @ApiProperty({
    example: 'NewStrongPassword123',
  })
  @IsStrongPassword(
    { minLength: 8, minSymbols: 0 },
    { message: 'Password must be at least 8 characters long' },
  )
  password: string;
}
