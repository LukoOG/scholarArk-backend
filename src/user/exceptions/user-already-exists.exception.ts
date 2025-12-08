import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super(
      { code: '10001', error: 'User already exists!' },
      HttpStatus.BAD_REQUEST,
    );
  }
}
