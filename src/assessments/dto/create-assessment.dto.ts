import { IsString, IsOptional, IsDateString, IsNumber, IsMongoId } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateAssessmentDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ description: 'seconds' }) @IsOptional() @IsNumber() duration_seconds?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startAt?: Date;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endAt?: Date;
  @ApiProperty() @IsMongoId() course_id: string;
}
