import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { GoogleClientService } from '../common/services/google.service';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, PRIVATE_FIELDS } from './schemas/user.schema';
import { UserFcmToken, UserFcmTokenSchema } from './schemas/user-fcm-token.schema';
import { preSave, preValidate } from './schemas/middleware';
import { userMethods } from './schemas/methods';
import { UserController } from './user.controller';
import { MulterModule } from '@nestjs/platform-express';
import { TMP_DIR } from 'src/config';

@Module({
  imports: [
    MulterModule.register({
      dest: TMP_DIR,
      limits: { fileSize: 25 * 1_000_000, files: 5 },
    }),
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory() {
          const schema = UserSchema;

          schema.set('toObject', {
            virtuals: true,
            transform: (_doc, ret) => {
              PRIVATE_FIELDS.forEach((field) => delete ret[field]);

              delete ret.__v;

              return ret
            }
          });

          schema.set('toJSON', {
            virtuals: true,
            transform: (_doc, ret) => {
              PRIVATE_FIELDS.forEach((field) => delete ret[field]);

              delete ret.__v;

              return ret
            }
          });

          for (const method of userMethods) schema.method(method.name, method);

          schema.virtual('fullName').get(function () {
            return `${this.first_name ?? ''} ${this.last_name ?? ''}`.trim();
          });
          schema.pre('validate', preValidate);

          return schema;
        },
      },
      {
        name: UserFcmToken.name,
        useFactory() {
          return UserFcmTokenSchema
        }
      },
    ]),
    CloudinaryModule,
    AuthModule
  ],
  providers: [UserService, GoogleClientService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule { }
