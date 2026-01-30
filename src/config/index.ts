import * as crypto from 'node:crypto';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { EnvironmentVariables } from './environment-variables';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export const APP_NAME = 'scholarArk';
export const TMP_DIR = path.join(os.tmpdir(), APP_NAME);

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
console.log('tmpdir', TMP_DIR);

const env = process.env as unknown as EnvironmentVariables;

export interface Config {
  apiUrl: string;
  websiteUrl: string;
  isProduction: boolean;
  port: number;
  mongo: { uri: string };
  cors: { origin: string[] | string };
  jwt: { secret: string; issuer: string; audience: string; expiresIn: string };
  paystack: { url: string, secret_key: string, public_key: string };
  gemini: string;
  google_client_id: string;
  cloudinary: { cloud_name: string, key: string, secret: string };
  redis: { host: string, port: number, password: string };
  resend: string;
  aws: { access: string, secret: string, bucket: string };
}

export function configuration() {
  const apiUrl = 'https://api.scholarArk.com';
  const websiteUrl = 'https://scholarArk.com';

  const randomPort = crypto.randomInt(49_152, 65_535); // using 0 might be better;

  const nodeEnv = env.NODE_ENV ?? 'development';
  const isProduction = ['prod', 'production'].includes(nodeEnv?.trim());

  const corsOrigin = isProduction
    ? [websiteUrl]
    : '*';

  const config: Config = {
    apiUrl,
    websiteUrl,
    isProduction,
    port: env.PORT || randomPort,
    mongo: {
      uri: env.MONGO_URI || `mongodb://127.0.0.1:27017/${APP_NAME}`,
    },
    cors: {
      origin: corsOrigin,
    },
    jwt: {
      secret: env.JWT_SECRET || 'insecure',
      issuer: env.JWT_ISSUER || apiUrl,
      audience: env.JWT_AUDIENCE || websiteUrl,
      expiresIn: env.JWT_EXPIRES_IN || '30d',
    },
    paystack: { url: env.PAYSTACK_BASE_URL, secret_key: env.PAYSTACK_SECRET_KEY, public_key: env.PAYSTACK_PUBLIC_KEY },
    google_client_id: env.GOOGLE_CLIENT_ID,
    gemini: env.GEMINI_API_KEY,
    cloudinary: {
        cloud_name: env.CLOUDINARY_CLOUD_NAME, 
        key: env.CLOUDINARY_API_KEY, 
        secret: env.CLOUDINARY_API_SECRET, 
      },
    redis: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD },
    resend: env.RESEND_API_KEY,
    aws: { access: env.AWS_ACCESS_KEY_ID, secret: env.AWS_SECRET_ACCESS_KEY, bucket: env.AWS_BUCKET_NAME }
  };

  return config;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) throw new Error(errors.toString());

  return validatedConfig;
}
