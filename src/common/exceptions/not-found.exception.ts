import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super({ code: '10000', message }, HttpStatus.NOT_FOUND);
  }
}
