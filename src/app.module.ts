import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SupervisionRequestsModule } from './supervision-requests/supervision-requests.module';
import { DepartmentsModule } from './departments/departments.module';
import { DepartmentDoctorsModule } from './department-doctors/department-doctors.module';
import { UniversitiesModule } from './universities/universities.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/config/winston.config';
import { LoggerModule } from './common/logger/logger.module';
import { ProjectsModule } from './projects/projects.module';
import { TeamsModule } from './teams/teams.module';
import { DoctorSpecializationModule } from './doctor-specialization/doctor-specialization.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';

@Module({
  imports: [
    // Config Module (should be first for environment variables)
    ConfigModule.forRoot({ isGlobal: true }),

    // Database Module
    MongooseModule.forRoot(process.env.MONGO_URI!),

    // Winston Logger Module
    WinstonModule.forRoot(winstonConfig),

    // Custom Logger Module
    LoggerModule,

    // Feature Modules
    AuthModule,
    UserModule,
    UniversitiesModule,
    DepartmentsModule,
    DepartmentDoctorsModule,
    SupervisionRequestsModule,
    ProjectsModule,
    TeamsModule,
    DoctorSpecializationModule,
    AdminDashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
