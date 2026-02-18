import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserRole } from 'src/common/enums';

export class UserRoleDto {
  @ApiPropertyOptional({
    enum: UserRole,
    example: "student",
    description: "The user role to query for. Leave blank to query all users"
  })
  @IsString()
  @IsOptional()
  role?: string;
}


export class UserQueryDto extends IntersectionType(
  PaginationDto,
  UserRoleDto
) {}