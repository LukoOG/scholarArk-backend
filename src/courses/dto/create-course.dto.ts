import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
  
	@IsEnum(['Beginner', 'Intermediate', 'Advanced']) //till we properly define our enums
	@IsOptional()
	difficulty?: string;


  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  students_enrolled?: number;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsNotEmpty()
  user_id: string; // ObjectId string
}
