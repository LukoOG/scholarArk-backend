import { IsString, IsOptional, IsDateString, IsNumber, IsMongoId } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateAssessmentDto {
  @ApiProperty({ example: "General Mathematics Class 3 Test" }) 
  @IsString() 
  title: string;

  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  description?: string;

  @ApiPropertyOptional({ description: 'amount of duration in seconds' })
  @IsOptional() 
  @IsNumber() 
  duration: number;

  @ApiProperty() 
  @IsMongoId() 
  course: string;
}
