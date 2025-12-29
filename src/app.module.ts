import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { redisStore } from 'cache-manager-ioredis-yet';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Config, configuration, validateEnv } from './config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminModule } from './admin/admin.module';
import { CoursesModule } from './courses/courses.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { PaymentModule } from './payment/payment.module';
import { GoalsModule } from './goals/goals.module';
import { TopicsModule } from './topics/topics.module';
import { PreferencesModule } from './preferences/preferences.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MetaModule } from './meta/meta.module';

@Module({
  imports: [
	CacheModule.register({
		isGlobal: true,
		useFactory: async (configService: ConfigService<Config, true>) => {
			const cacheConfig = configService.get('redis', { infer: true });
			
			return {store: await redisStore({
				host: cacheConfig.host,
				port: Number(cacheConfig.port),
				password: cacheConfig.password,
				ttl: 60,
			})}
		}
		
	}),
    EventEmitterModule.forRoot({
      wildcard: false,
      verboseMemoryLeak: false,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'l0', limit: 4, ttl: 60 * 1_000 },
      ],
    }),
	MongooseModule.forRootAsync({
		inject: [ConfigService],
		useFactory(configService: ConfigService<Config, true>){
			const mongoConfig = configService.get('mongo', { infer: true });
			return { uri: mongoConfig.uri }
		}
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
	ScheduleModule.forRoot(),
    UserModule,
    AdminModule,
    CoursesModule,
    AssessmentsModule,
    PaymentModule,
    GoalsModule,
    TopicsModule,
    PreferencesModule,
    AuthModule,
    MailModule,
    NotificationsModule,
    MetaModule,
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
