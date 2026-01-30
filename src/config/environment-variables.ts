import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUppercase,
  IsUrl,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { NodeEnv } from 'src/common/enums';

export class EnvironmentVariables {
  @Max(65535)
  @Min(0)
  @IsNumber()
  PORT: number;

  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @IsUrl({ protocols: ['mongo', 'mongodb+srv'], require_protocol: true })
  @IsOptional()
  MONGO_URI: string;

  @IsString()
  @IsOptional()
  JWT_SECRET: string;

  @IsUrl()
  @IsOptional()
  JWT_ISSUER: string;

  @IsUrl()
  @IsOptional()
  JWT_AUDIENCE: string;

  @Matches(/^\d+[shd]?$/)
  @IsOptional()
  JWT_EXPIRES_IN: string;

  @IsString()
  @IsUrl()
  PAYSTACK_BASE_URL: string;

  @IsString()
  PAYSTACK_PUBLIC_KEY: string;

  @IsString()
  PAYSTACK_SECRET_KEY: string;

  @IsUrl()
  @IsOptional()
  PAYSTACK_CALLBACK_URL: string;

  @IsPositive()
  @IsOptional()
  PAYSTACK_MINIMUM_BALANCE: number;

  @IsString()
  GEMINI_API_KEY: string;

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  CLOUDINARY_CLOUD_NAME: string;

  @IsString()
  CLOUDINARY_API_KEY: string;

  @IsString()
  CLOUDINARY_API_SECRET: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  REDIS_PASSWORD: string;

  @IsString()
  RESEND_API_KEY: string;

  @IsString()
  AWS_ACCESS_KEY_ID

  @IsString()
  AWS_SECRET_ACCESS_KEY

  @IsString()
  AWS_BUCKET_NAME

}
