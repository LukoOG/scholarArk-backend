import { ApiProperty } from "@nestjs/swagger"
import { IsEnum } from "class-validator";

enum FileFormat {
    MP4 = "video/mp4",
    WEBM = "video/webm",
    PDF = "pdf",
    TXT = "txt"
}
export class UploadLessonDto{
    @ApiProperty({
        enum: FileFormat
    })
    @IsEnum(FileFormat)
    type: FileFormat;
}

export class UploadLessonResponseDto {
    @ApiProperty({})
    url: string;

    key: string;

    expiresIn: number;
}