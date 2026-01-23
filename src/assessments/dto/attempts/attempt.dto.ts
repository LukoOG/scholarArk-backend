import { IsArray, IsMongoId, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class SubmitAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class AnswerDto {
  @IsMongoId()
  questionId: string;

  @IsString()
  answer: string;
}
