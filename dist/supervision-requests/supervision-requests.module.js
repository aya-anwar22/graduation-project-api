"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupervisionRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const supervision_requests_controller_1 = require("./supervision-requests.controller");
const supervision_requests_service_1 = require("./supervision-requests.service");
const supervision_request_schema_1 = require("./schemas/supervision-request.schema");
const supervision_request_member_schema_1 = require("./schemas/supervision-request-member.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
const department_schema_1 = require("../departments/schemas/department.schema");
const notifications_module_1 = require("../notifications/notifications.module");
const email_module_1 = require("../common/email/email.module");
const teams_module_1 = require("../teams/teams.module");
const department_doctor_schema_1 = require("../department-doctors/schemas/department-doctor.schema");
const group_chats_module_1 = require("../chats/schemas/group-chats.module");
const project_file_schema_1 = require("../projects/schemas/project-file.schema");
const project_technology_schema_1 = require("../projects/schemas/project-technology.schema");
let SupervisionRequestsModule = class SupervisionRequestsModule {
};
exports.SupervisionRequestsModule = SupervisionRequestsModule;
exports.SupervisionRequestsModule = SupervisionRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: supervision_request_schema_1.SupervisionRequest.name, schema: supervision_request_schema_1.SupervisionRequestSchema },
                {
                    name: supervision_request_member_schema_1.SupervisionRequestMember.name,
                    schema: supervision_request_member_schema_1.SupervisionRequestMemberSchema,
                },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: project_schema_1.Project.name, schema: project_schema_1.ProjectSchema },
                { name: department_doctor_schema_1.DepartmentDoctor.name, schema: department_doctor_schema_1.DepartmentDoctorSchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: project_file_schema_1.ProjectFile.name, schema: project_file_schema_1.ProjectFileSchema },
                { name: project_technology_schema_1.ProjectTechnology.name, schema: project_technology_schema_1.ProjectTechnologySchema },
            ]),
            notifications_module_1.NotificationsModule,
            email_module_1.EmailModule,
            teams_module_1.TeamsModule,
            group_chats_module_1.GroupChatsModule,
            teams_module_1.TeamsModule,
        ],
        controllers: [supervision_requests_controller_1.SupervisionRequestsController],
        providers: [supervision_requests_service_1.SupervisionRequestsService],
        exports: [supervision_requests_service_1.SupervisionRequestsService],
    })
], SupervisionRequestsModule);
//# sourceMappingURL=supervision-requests.module.js.map