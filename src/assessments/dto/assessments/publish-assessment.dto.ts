import { IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PublishAssessmentDto {
  @ApiProperty({
    description: 'Publish or unpublish assessment',
    example: true,
  })
  @IsBoolean()
  publish: boolean;
}
