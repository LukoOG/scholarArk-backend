import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsString, IsOptional, IsDateString, IsEnum, IsMongoId } from 'class-validator';
import { MediaDto } from 'src/common/dto/media.dto';
import { Gender, UserRole } from 'src/common/enums';
import { ParseArray } from 'src/common/transforms/parse-array-transform';

export class UpdateUserDto {
  // Profile fields
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ type: String, format: 'date', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @ApiPropertyOptional({ type: String, example: 'I am an English teacher serving for 50 years' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: '123 Main St, Lagos, Nigeria' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'BSc Computer Science' })
  @IsOptional()
  @IsString()
  highest_qualification?: string;

  @ApiPropertyOptional({
    example: {
      "s3key":"users/667234983as/345/pic.jpeg",
      "size":"34902",
      "mimeType":"image.jpeg"
    }
  })
  @IsOptional()
  @IsString()
  profile_pic?: MediaDto;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.STUDENT })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  // Preferences / selections
  @ApiPropertyOptional({
    type: [String],
    description: 'Selected goal IDs',
    example: ['64f0d2c5e92f3b0012345678', '64f0d2c5e92f3b0012345679'],
  })
  @IsOptional()
  @Transform(ParseArray())
  @IsArray()
  @IsMongoId({ each: true })
  goalIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Selected topic IDs',
    example: ['64f0d2c5e92f3b0012345680', '64f0d2c5e92f3b0012345681'],
  })
  @IsOptional()
  @Transform(ParseArray())
  @IsArray()
  @IsMongoId({ each: true })
  topicIds?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Selected preference IDs',
    example: ['64f0d2c5e92f3b0012345682', '64f0d2c5e92f3b0012345683'],
  })
  @IsOptional()
  @Transform(ParseArray())
  @IsArray()
  @IsMongoId({ each: true })
  preferenceIds?: string[];
}
