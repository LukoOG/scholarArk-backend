import { IsString, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveFcmTokenDto {
  @ApiProperty({ example: "fcm-token from firebase" })
  @IsString()
  fcmToken: string;
  
  @ApiPropertyOptional({ example: "android" })
  @IsOptional()
  @IsEnum(['android', 'ios', 'web'])
  device?: 'android' | 'ios' | 'web';

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  remindersEnabled?: boolean;
}
