"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const department_schema_1 = require("../departments/schemas/department.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
const supervision_request_schema_1 = require("../supervision-requests/schemas/supervision-request.schema");
const university_schema_1 = require("../universities/schemas/university.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const admin_dashboard_controller_1 = require("./admin-dashboard.controller");
const admin_dashboard_service_1 = require("./admin-dashboard.service");
const department_doctor_schema_1 = require("../department-doctors/schemas/department-doctor.schema");
const team_schema_1 = require("../teams/schemas/team.schema");
const team_member_schema_1 = require("../teams/schemas/team-member.schema");
const doctor_specialization_schema_1 = require("../doctor-specialization/schema/doctor-specialization.schema");
const user_auth_schema_1 = require("../auth/schemas/user-auth.schema");
let AdminDashboardModule = class AdminDashboardModule {
};
exports.AdminDashboardModule = AdminDashboardModule;
exports.AdminDashboardModule = AdminDashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: university_schema_1.University.name, schema: university_schema_1.UniversitySchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: project_schema_1.Project.name, schema: project_schema_1.ProjectSchema },
                { name: supervision_request_schema_1.SupervisionRequest.name, schema: supervision_request_schema_1.SupervisionRequestSchema },
                { name: department_doctor_schema_1.DepartmentDoctor.name, schema: department_doctor_schema_1.DepartmentDoctorSchema },
                { name: team_schema_1.Team.name, schema: team_schema_1.TeamSchema },
                { name: team_member_schema_1.TeamMember.name, schema: team_member_schema_1.TeamMemberSchema },
                { name: doctor_specialization_schema_1.DoctorProfile.name, schema: doctor_specialization_schema_1.DoctorProfileSchema },
                { name: user_auth_schema_1.UserAuth.name, schema: user_auth_schema_1.UserAuthSchema },
            ]),
        ],
        controllers: [admin_dashboard_controller_1.AdminDashboardController],
        providers: [admin_dashboard_service_1.AdminDashboardService],
    })
], AdminDashboardModule);
//# sourceMappingURL=admin-dashboard.module.js.map