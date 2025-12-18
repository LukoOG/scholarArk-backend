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
    let errorPayload: any = { message: 'Internal server error' };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      errorPayload = typeof res === 'string' ? { message: res } : res;
    }

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
      console.error('🚨 API ERROR');
      console.error('Status:', status);
      console.error('Request:', safeRequestLog);

      if (exception instanceof Error) {
        console.error('Error:', exception.message);
        console.error('Stack:', exception.stack);
      } else {
        console.error('Error:', exception);
      }
    //}

    response.status(status).json(
      ResponseHelper.error(
        errorPayload?.message ?? errorPayload,
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
}