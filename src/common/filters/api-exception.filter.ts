import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseHelper } from '../helpers/api-response.helper';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = { message: 'Internal server error' };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorResponse = exception.getResponse();
    }

    let res = ResponseHelper.error(errorResponse, status);
	if (errorResponse.message) res = ResponseHelper.error(errorResponse.message, status)
    response.status(status).json(res);
  }
}
