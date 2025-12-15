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
  gemini: string;
  google_client_id: string;
  cloudinary: { cloud_name: string, key: string, secret: string };
  redis: { host: string, port: number, password: string }
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
	google_client_id: env.GOOGLE_CLIENT_ID,
	gemini: env.GEMINI_API_KEY,
	cloudinary: {
			cloud_name: env.CLOUDINARY_CLOUD_NAME, 
			key: env.CLOUDINARY_API_KEY, 
			secret: env.CLOUDINARY_API_SECRET, 
		},
	redis: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD },
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
