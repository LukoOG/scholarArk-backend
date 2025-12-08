//no request body needed as the server will start the attempt
export class StartAttemptDto {}

export class SubmitAttemptDto {
  answers: { questionId: string; answer: string | string[] }[];
}
