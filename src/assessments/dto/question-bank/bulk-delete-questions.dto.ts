import { IsMongoId, IsArray } from "class-validator";

export class BulkDeleteQuestionsDto {
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];
}
