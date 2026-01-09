import { IsString, IsOptional, IsDateString, IsNumber, IsMongoId } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateAssessmentDto {
  @ApiProperty({ example: "General Mathematics Class 3 Test" }) @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ description: 'seconds' }) @IsOptional() @IsNumber() duration_seconds: number;
  @ApiPropertyOptional() @IsDateString() startAt: Date;
  @ApiPropertyOptional() @IsDateString() endAt: Date;
  @ApiProperty() @IsMongoId() course_id: string;
}
