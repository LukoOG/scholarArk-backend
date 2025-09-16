import { Injectable } from '@nestjs/common';
import { APP_NAME, Config } from './config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService<Config, true>,
  ) {}

  getHello(): string {
    return `${APP_NAME} api says: "Hello World!"`;
  }
}
