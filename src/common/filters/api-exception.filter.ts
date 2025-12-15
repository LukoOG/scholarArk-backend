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
    };
	
	if(status === HttpStatus.INTERNAL_SERVER_ERROR){
		if(process.env.NODE_ENV === "development"){
			console.error('🔥 INTERNAL SERVER ERROR');
			console.error('➡️ ', request.method, request.url);
			console.error('🧾 Body:', request.body);
			console.error('❌ Error:', exception);	
		}
	};
	
    response.status(status).json(
		ResponseHelper.error(errorPayload?.message ?? errorPayload, status) 
	);
  }
}
