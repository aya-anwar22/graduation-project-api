"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const supervision_requests_module_1 = require("./supervision-requests/supervision-requests.module");
const departments_module_1 = require("./departments/departments.module");
const department_doctors_module_1 = require("./department-doctors/department-doctors.module");
const universities_module_1 = require("./universities/universities.module");
const nest_winston_1 = require("nest-winston");
const winston_config_1 = require("./common/config/winston.config");
const logger_module_1 = require("./common/logger/logger.module");
const projects_module_1 = require("./projects/projects.module");
const teams_module_1 = require("./teams/teams.module");
const doctor_specialization_module_1 = require("./doctor-specialization/doctor-specialization.module");
const admin_dashboard_module_1 = require("./admin-dashboard/admin-dashboard.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URI),
            nest_winston_1.WinstonModule.forRoot(winston_config_1.winstonConfig),
            logger_module_1.LoggerModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            universities_module_1.UniversitiesModule,
            departments_module_1.DepartmentsModule,
            department_doctors_module_1.DepartmentDoctorsModule,
            supervision_requests_module_1.SupervisionRequestsModule,
            projects_module_1.ProjectsModule,
            teams_module_1.TeamsModule,
            doctor_specialization_module_1.DoctorSpecializationModule,
            admin_dashboard_module_1.AdminDashboardModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map