import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateModuleDto {
  @ApiProperty({
    example: 'JavaScript Basics',
    description: 'Module title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Covers the fundamentals of JavaScript',
    description: 'Module description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
