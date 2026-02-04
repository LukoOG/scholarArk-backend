import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        error: 'ACCOUNT_ALREADY_EXISTS',
        message: `An account has already been created with this email`,
        email,
      },
      HttpStatus.CONFLICT
    );
  }
}
