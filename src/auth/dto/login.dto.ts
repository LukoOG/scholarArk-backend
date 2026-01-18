import { IsString } from 'class-validator';
import { EmailValidator } from 'src/common/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @EmailValidator()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  role: string;
}
