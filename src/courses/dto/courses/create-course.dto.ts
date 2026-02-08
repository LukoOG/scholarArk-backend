import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CourseCategory, CourseDifficulty } from '../../schemas/course.schema';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentCurrency } from 'src/payment/schemas/payment.schema';
import { ParseArray } from 'src/common/transforms/parse-array-transform';
import { MediaDto } from 'src/common/dto/media.dto';
import { CreateModuleDto } from '../modules/create-module.dto';

class PriceDto {
  @ApiProperty({
    example: PaymentCurrency.NAIRA,
    enum: PaymentCurrency,
    description: "Regional Currency Code"
  })
  @IsNotEmpty()
  @IsString()
  currency: PaymentCurrency

  @ApiProperty({
    example: 20000,
    description: "Price amount in major unit of specified currency"
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number
}

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Complete JavaScript Mastery',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Learn JavaScript from beginner to advanced',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Course category',
    enum: CourseCategory,
    example: CourseCategory.PROGRAMMING,
  })
  @IsEnum(CourseCategory)
  category: CourseCategory;

  @ApiPropertyOptional({
    description: 'Course difficulty level',
    enum: CourseDifficulty,
    example: CourseDifficulty.BEGINNER,
  })
  @IsOptional()
  @IsEnum(CourseDifficulty)
  difficulty?: CourseDifficulty;

  @ApiPropertyOptional({
    description: 'Thumbnail url returned from S3 bucket upload',
    type: MediaDto,
  })
  @IsUrl()
  @IsOptional()
  @ValidateNested()
  @Type(()=>MediaDto)
  thumbnail?: MediaDto;

  @ApiProperty({
    description: 'List of Course Prices in Supported Currencies',
    type: [PriceDto],
    example: [
      { currency: 'NGN', amount: 15000 },
      { currency: 'USD', amount: 40 },
    ],
  })
  @Transform(ParseArray())
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceDto)
  prices: PriceDto[];

  @ApiProperty({
    description: 'Modules included in the course',
    type: [CreateModuleDto],
  })
  @Transform(ParseArray())
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  modules: CreateModuleDto[];
}



export class TestModuleDTO {
  @IsInt()
  id: number;

  @IsArray()
  @IsString({ each: true })
  lessons: string[];
}

export class TestDTO {
  @IsString()
  email: string;

  @IsString()
  name: string

  @Transform(ParseArray())
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestModuleDTO)
  module: TestModuleDTO[];
}