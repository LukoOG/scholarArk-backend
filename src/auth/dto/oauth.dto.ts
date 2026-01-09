import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from 'src/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OauthDto {
  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.STUDENT,
    description: 'Optional role for first-time signup only',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
  
  @ApiProperty({
    description: 'Google ID token obtained from Google Sign-In',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
  })
  @IsString()
  token: string;
}