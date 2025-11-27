import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Config, configuration, validateEnv } from './config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminModule } from './admin/admin.module';
import { CoursesModule } from './courses/courses.module';
import { AssessmentsModule } from './assessments/assessments.module';

@Module({
  imports: [
  /**
	CacheModule.register({
		isGlobal: true,
		
	}),
	**/
    EventEmitterModule.forRoot({
      wildcard: false,
      verboseMemoryLeak: false,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'l0', limit: 4, ttl: 60 * 1_000 },
        /**{ name: 'l1', limit: 10, ttl: 10 * 60 * 1_000 },
        { name: 'l2', limit: 20, ttl: 60 * 60 * 1_000 },**/
      ],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService<Config, true>) {
        const mongoConfig = configService.get('mongo', { infer: true });
        return { uri: mongoConfig.uri };
      },
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService<Config, true>) {
        const jwtConfig = configService.get('jwt', { infer: true });

        return {
          secret: jwtConfig.secret,

          signOptions: {
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
            expiresIn: jwtConfig.expiresIn,
          },

          verifyOptions: {
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
          },
        };
      },
      global: true,
    }),
    ConfigModule.forRoot({
      load: [configuration],
      validate: validateEnv,
      isGlobal: true,
      cache: true,
    }),
    UserModule,
    AdminModule,
    CoursesModule,
    AssessmentsModule,
  ],
  controllers: [AppController],
  providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		}
	],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
