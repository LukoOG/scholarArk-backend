import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateCourseDto {
	@ApiProperty({ example: 'Mathematics 101' })
	@IsString()
	@IsNotEmpty()
	title: string;
	
	@ApiPropertyOptional({ example: 'A complete course to master the fundamentals of mathematics for junior secondary students' })
	@IsString()
	@IsOptional()
	description?: string;
	
	@ApiPropertyOptional({ example: 'Beginner' })
	@IsEnum(['Beginner', 'Intermediate', 'Advanced']) //till we properly define our enums
	@IsOptional()
	difficulty?: string;

	@ApiPropertyOptional({ example: 10000.00 })
	@IsNumber()
	@IsOptional()
	price?: number;
	
	@ApiPropertyOptional({ example: 20 })
	@IsNumber()
	@IsOptional()
	students_enrolled?: number;
	
	@ApiPropertyOptional({ example: 'https://www.bing.com/images/search?view=detailV2&ccid=0T0cC7t4&id=B91455B44ACD53474402DF9B13CA6CF4E73E7640&thid=OIP.0T0cC7t4zN9F2snpTs4R0wHaE8&mediaurl=https%3a%2f%2fwww.umc.org%2f-%2fmedia%2fumc-media%2f2024%2f02%2f21%2f22%2f52%2fstack-of-books-recommended-reading.jpeg%3fmw%3d1200%26hash%3d6E209BCE991F928F9D5F81B2F357A281&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.d13d1c0bbb78ccdf45dac9e94ece11d3%3frik%3dQHY%252b5%252fRsyhOb3w%26pid%3dImgRaw%26r%3d0&exph=800&expw=1200&q=books&FORM=IRPRST&ck=8B005F9DAC21BAAD357713B44B62DAE7&selectedIndex=0&itb=0' })
	@IsString()
	@IsOptional()
	thumbnail_url?: string;
	
	@ApiPropertyOptional({ example: 0 })
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
