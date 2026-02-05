import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsString, IsOptional,IsDateString, IsEnum, IsMongoId } from 'class-validator';
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

  @ApiPropertyOptional({ example: '123 Main St, Lagos, Nigeria' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'BSc Computer Science' })
  @IsOptional()
  @IsString()
  highest_qualification?: string;

  @ApiPropertyOptional({ example: 's3://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profile_pic?: string;

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
