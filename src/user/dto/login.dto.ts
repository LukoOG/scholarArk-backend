import { IsStrongPassword } from 'class-validator';
import { EmailValidator } from 'src/common/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @EmailValidator()
  email: string;

  @ApiProperty()
  password: string;
}
