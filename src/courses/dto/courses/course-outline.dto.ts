import { ApiProperty } from "@nestjs/swagger";

export class LessonOutlineDto {
  @ApiProperty({ example: 'Introduction to JavaScript' })
  title: string;

  @ApiProperty({ example: 1 })
  position: number;

  @ApiProperty({ example: 420 })
  duration: number;

  @ApiProperty({ example: true })
  isPreview: boolean;
}


export class ModuleOutlineDto {
  @ApiProperty({ example: 'JavaScript Basics' })
  title: string;

  @ApiProperty({ example: 1 })
  position: number;

  @ApiProperty({ example: 1800 })
  totalDuration: number;

  @ApiProperty({ type: [LessonOutlineDto] })
  lessons: LessonOutlineDto[];
}

export class CourseOutlineDto {
  @ApiProperty({ example: 'Complete JavaScript Mastery' })
  title: string;

  @ApiProperty({ example: 'Learn JavaScript from beginner to advanced' })
  description: string;

  @ApiProperty({ example: 5400 })
  totalDuration: number;

  @ApiProperty({ type: [ModuleOutlineDto] })
  modules: ModuleOutlineDto[];
}
