// dto/create-course-multipart.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseMultipartDto {
  @ApiProperty({
    type: 'string',
    description:
      'Stringified CreateCourseDto JSON. ' +
      'Each lesson that has media must include a mediaKey that matches a file originalname.',
    example: JSON.stringify({
      title: 'Demo Course',
      category: 'backend',
      difficulty: 'beginner',
      modules: [
        {
          title: 'Module 1',
          lessons: [
            {
              title: 'Introduction',
              mediaKey: 'intro.mp4',
              duration: 5,
            },
          ],
        },
      ],
    }),
  })
  json: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description:
      'Lesson media files. ' +
      'Each file originalname MUST match lesson.mediaKey',
  })
  files: any[];
}
