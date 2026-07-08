"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const projects_service_1 = require("./projects.service");
const project_schema_1 = require("./schemas/project.schema");
const team_schema_1 = require("../teams/schemas/team.schema");
const team_member_schema_1 = require("../teams/schemas/team-member.schema");
const project_file_schema_1 = require("./schemas/project-file.schema");
const project_technology_schema_1 = require("./schemas/project-technology.schema");
const supervision_request_schema_1 = require("../supervision-requests/schemas/supervision-request.schema");
const supervision_request_member_schema_1 = require("../supervision-requests/schemas/supervision-request-member.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const projects_controller_1 = require("./projects.controller");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const department_doctor_schema_1 = require("../department-doctors/schemas/department-doctor.schema");
let ProjectsModule = class ProjectsModule {
};
exports.ProjectsModule = ProjectsModule;
exports.ProjectsModule = ProjectsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: project_schema_1.Project.name, schema: project_schema_1.ProjectSchema },
                { name: team_schema_1.Team.name, schema: team_schema_1.TeamSchema },
                { name: team_member_schema_1.TeamMember.name, schema: team_member_schema_1.TeamMemberSchema },
                { name: project_file_schema_1.ProjectFile.name, schema: project_file_schema_1.ProjectFileSchema },
                { name: project_technology_schema_1.ProjectTechnology.name, schema: project_technology_schema_1.ProjectTechnologySchema },
                { name: supervision_request_schema_1.SupervisionRequest.name, schema: supervision_request_schema_1.SupervisionRequestSchema },
                {
                    name: supervision_request_member_schema_1.SupervisionRequestMember.name,
                    schema: supervision_request_member_schema_1.SupervisionRequestMemberSchema,
                },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: 'DepartmentDoctor', schema: department_doctor_schema_1.DepartmentDoctorSchema },
            ]),
            cloudinary_module_1.CloudinaryModule,
        ],
        controllers: [projects_controller_1.ProjectsController],
        providers: [projects_service_1.ProjectsService],
        exports: [projects_service_1.ProjectsService],
    })
], ProjectsModule);
//# sourceMappingURL=projects.module.js.map