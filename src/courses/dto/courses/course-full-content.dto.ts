import { ApiProperty } from "@nestjs/swagger";

export class LessonDto {
  @ApiProperty({ example: 'Introduction to JavaScript' })
  title: string;

  @ApiProperty({ enum: ['video', 'article', 'quiz'] })
  type: string;

  @ApiProperty({ example: 420 })
  duration: number;

  @ApiProperty({ example: false })
  isPreview: boolean;

  @ApiProperty({ example: 'JavaScript is a programming language...' })
  content: string;
}

export class ModuleDto {
  @ApiProperty({ example: 'JavaScript Basics' })
  title: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ type: [LessonDto] })
  lessons: LessonDto[];
}

export class CourseFullContentResponseDto {
  @ApiProperty({ example: '695bbc7f050dceb9e3202e22' })
  _id: string;

  @ApiProperty({ example: 'Complete JavaScript Mastery' })
  title: string;

  @ApiProperty({ example: 'Learn JavaScript from beginner to advanced' })
  description: string;

  @ApiProperty({
    example: { _id: '...', name: 'John Doe' },
  })
  tutor: {
    _id: string;
    name: string;
  };

  @ApiProperty({ type: [ModuleDto] })
  modules: ModuleDto[];
}
