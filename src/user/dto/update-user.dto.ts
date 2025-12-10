import { PartialType } from '@nestjs/mapped-types';
import { CompleteSignupDto } from './signup.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CompleteSignupDto) {
  @ApiPropertyOptional({ type: [String], description: 'Selected goal IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  goalIds?: string[];
  
  @ApiPropertyOptional({ type: [String], description: 'Selected topic IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  topicIds? string[];
  
  @ApiPropertyOptional({ type: [String], description: 'Selected preference IDs' })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  preferenceIds?: string[];
}
