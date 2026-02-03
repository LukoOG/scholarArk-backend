import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountExistsWithOAuthException extends HttpException {
  constructor(provider: 'google' | 'github' | 'facebook') {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        error: 'ACCOUNT_EXISTS_WITH_OAUTH',
        message: `This email is already registered using ${provider}`,
        provider,
      },
      HttpStatus.CONFLICT,
    );
  }
}
