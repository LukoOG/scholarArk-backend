import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator";

export class MediaDto {
    @ApiProperty({
        description: 'S3 object key where the media is stored',
        example: 'courses/123/lessons/456/video.mp4',
    })
    @IsString()
    @IsNotEmpty()
    s3key: string;

    @ApiPropertyOptional({
        description: 'File size in bytes',
        example: 104857600,
    })
    @IsOptional()
    @IsNumber()
    size?: number;

    @ApiProperty({
        description: 'Mime type of the uploaded file',
        example: 'video/mp4',
    })
    @IsString()
    mimeType?: string;
}