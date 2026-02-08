import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigService } from '@nestjs/config';
import { GoogleClientService } from '../common/services/google.service';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, PRIVATE_FIELDS } from './schemas/user.schema';
import { UserFcmToken, UserFcmTokenSchema } from './schemas/user-fcm-token.schema';
import { preSave, preValidate } from './schemas/middleware';
import { userMethods } from './schemas/methods';
import { UserController } from './user.controller';
import { MulterModule } from '@nestjs/platform-express';
import { Config, TMP_DIR } from 'src/config';
import { MediaService } from 'src/common/services/media.service';

@Module({
  imports: [
    MulterModule.register({
      dest: TMP_DIR,
      limits: { fileSize: 25 * 1_000_000, files: 5 },
    }),
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory(configSerivce: ConfigService<Config, true>) {
          const schema = UserSchema;
          const CDN_URL = configSerivce.get('aws', {infer: true}).cdn;

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

          schema.virtual('profilePicUrl').get(function () {
            if(!this.profile_pic?.key) return null;
            if(typeof this.profile_pic === "string") return this.profile_pic;

            return `${CDN_URL}/${this.profile_pic.key}`
          })

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
  providers: [UserService, GoogleClientService, MediaService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule { }
