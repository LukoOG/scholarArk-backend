import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { UserModule } from 'src/user/user.module';
import { PaystackService } from './paystack/paystack.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { CoursesModule } from 'src/courses/courses.module';
import { PaystackWebhookController } from './webhooks/paystack.webhook.controller';


@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config, true>) => {
        const paystackUrl = configService.get('paystack', {infer:true}).url
        const secretKey = configService.get('paystack', {infer:true}).secret_key

        return {
          baseURL: paystackUrl,
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      }
    }),
    MongooseModule.forFeature(
      [
        {
          name: Payment.name,
          schema: PaymentSchema
        }
      ]
    ),
    AuthModule,
    UserModule,
    EnrollmentModule,
    CoursesModule,
  ],
  controllers: [PaymentController, PaystackWebhookController],
  providers: [PaymentService, PaystackService],
})
export class PaymentModule { }
