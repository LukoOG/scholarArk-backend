import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from '../helpers/api-response.helper';
import { ConfigService } from '@nestjs/config';
import { Config } from '../../config';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let rawError: unknown = "Internal Server Error"

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      rawError = exception.getResponse();
    } else if (exception instanceof Error) {
      rawError = exception.message;
    }

    const normalizedError = this.normalizeErrorMessage(rawError);

    // 🔐 Safe request logging (no secrets)
    const safeRequestLog = {
      method: request.method,
      url: request.originalUrl,
      params: request.params,
      query: request.query,
      body: this.sanitizeBody(request.body),
    };

    /**
     * LOGGING STRATEGY
     * - 5xx → always log (dev + prod)
     * - 4xx → log only in dev
     */
    const isServerError = status >= 500;
    const isDev = process.env.NODE_ENV !== 'production';

    //if (isServerError || isDev) {
      // console.error('🚨 API ERROR');
      // console.error('Status:', status);
      // console.error('Request:', safeRequestLog);

      // if (exception instanceof Error) {
      //   console.error('Error:', exception.message);
      //   console.error('Stack:', exception.stack);
      // } else {
      //   console.error('Error:', exception);
      // }
    //}
    if (isServerError || isDev) {
      console.error('🚨 API ERROR');
      console.error('Status:', status);
      console.error('Request:', safeRequestLog);
      console.error('Error:', normalizedError);

      if (exception instanceof Error) {
        console.error('Stack:', exception.stack);
      }
    }

    response.status(status).json(
      ResponseHelper.error(
        normalizedError,
        status,
      ),
    );
  }

  /**
   * Remove sensitive fields before logging
   */
  private sanitizeBody(body: any) {
    if (!body || typeof body !== 'object') return body;

    const clone = { ...body };
    const SENSITIVE_KEYS = ['password', 'accessToken', 'token', 'refreshToken'];

    for (const key of SENSITIVE_KEYS) {
      if (key in clone) clone[key] = '[REDACTED]';
    }

    return clone;
  }

  private normalizeErrorMessage(error: unknown): string | string[] {
    if (!error) return 'Internal server error';

    // String
    if (typeof error === 'string') {
      return error;
    }

    // Array of strings
    if (Array.isArray(error)) {
      return error.map(String);
    }

    // HttpException response object
    if (typeof error === 'object') {
      const err = error as any;

      // Nest validation pipe error
      if (Array.isArray(err.message)) {
        return err.message.map(String);
      }

      // Mongoose validation errors
      if (err.errors && typeof err.errors === 'object') {
        return Object.values(err.errors).map((e: any) => e.message);
      }

      // Generic object with message
      if (err.message) {
        return typeof err.message === 'string'
          ? err.message
          : this.normalizeErrorMessage(err.message);
      }
    }

    return 'Internal server error';
  }

}