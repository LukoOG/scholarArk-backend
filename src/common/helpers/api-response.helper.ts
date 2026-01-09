import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';

export class ResponseHelper {
  static success<T>(
    data: T,
    statusCode: number = HttpStatus.OK
  ): ApiResponse<T> {
    return {
      data,
      statusCode,
      error: null,
    };
  }

  static error(
    error: any,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
  ): ApiResponse {
    return {
      data: null,
      statusCode,
      error,
    };
  }
}
