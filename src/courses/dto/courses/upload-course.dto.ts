import { ApiProperty } from "@nestjs/swagger"
import { IsEnum } from "class-validator";

enum FileFormat {
  MP4 = "video/mp4",
  WEBM = "video/webm",
  PDF = "pdf",
}
export class UploadLessonDto {
  @ApiProperty({
    description: 'Mime type of the uploaded file',
    example: 'video/mp4',
    enum: FileFormat
  })
  @IsEnum(FileFormat)
  type: FileFormat;
}

export const FILE_FORMAT_CONFIG = {
  [FileFormat.MP4]: {
    contentType: 'video/mp4',
    extension: 'mp4',
    kind: 'video',
  },
  [FileFormat.WEBM]: {
    contentType: 'video/webm',
    extension: 'webm',
    kind: 'video',
  },
  [FileFormat.PDF]: {
    contentType: 'application/pdf',
    extension: 'pdf',
    kind: 'article',
  },
} as const;


export class UploadLessonResponseDto {
  @ApiProperty({ description: "Signed AWS S3 bucket url to use in PUT request" })
  url: string;

  @ApiProperty({ description: "Key of the lesson file" })
  key: string;

  @ApiProperty({ description: "Amount of time till url expires in seconds", example: 300 })
  expiresIn: number;
}

export class PlayLessonResponseDto {
  @ApiProperty({ description: "Signed AWS S3 bucket url to fetch lesson resource" })
  url: string;
}