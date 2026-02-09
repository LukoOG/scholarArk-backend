import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { adminMethods } from './schemas/methods';
import { preSave } from './schemas/middleware';
import { UserModule } from 'src/user/user.module';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Admin.name,
        useFactory() {
          const schema = AdminSchema;

          for (const method of adminMethods) schema.method(method.name, method);

          schema.pre('save', preSave);

          return schema;
        },
      },
      {
        name: User.name,
        useFactory() {
          return UserSchema
        }
      }
    ]),
    AuthModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule { }
