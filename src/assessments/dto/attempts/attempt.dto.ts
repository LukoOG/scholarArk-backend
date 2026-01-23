import { IsArray, IsMongoId, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Types } from "mongoose";

export class SubmitAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

export class AnswerDto {
  @IsMongoId()
  questionId: Types.ObjectId;

  @IsString()
  answer: string;
}
