import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController, AuthV2Controller } from './auth.controller';
import { UserAuth, UserAuthSchema } from './schemas/user-auth.schema';
import { UserModule } from 'src/user/user.module';
import { JwtUtil } from '../common/utils/jwt.util';
import { MailService } from './mail/mail.service';
import { SharedModule } from 'src/common/shared.module';
import { UniversitySchema } from 'src/universities/schemas/university.schema';
import { DepartmentSchema } from 'src/departments/schemas/department.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAuth.name, schema: UserAuthSchema },
      { name: 'University', schema: UniversitySchema },
      { name: 'Department', schema: DepartmentSchema },
    ]),
    forwardRef(() => UserModule),
    SharedModule,
  ],
  controllers: [AuthController, AuthV2Controller],
  providers: [AuthService, JwtUtil, MailService],
  exports: [AuthService],
})
export class AuthModule {}
