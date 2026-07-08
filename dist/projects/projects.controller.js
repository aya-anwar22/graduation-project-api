"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const projects_service_1 = require("./projects.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_guard_1 = require("../common/guards/auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const update_project_status_dto_1 = require("./dto/update-project-status.dto");
const user_schema_1 = require("../user/schemas/user.schema");
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async uploadFileToMyProject(file, description, user) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        const userId = user.userId || user.id || user._id;
        return this.projectsService.uploadProjectFileByToken(file, userId, description);
    }
    async getDoctorStats(req) {
        const doctorId = req.user.id;
        const stats = await this.projectsService.getDoctorDashboardStats(doctorId);
        return {
            message: 'Doctor dashboard statistics retrieved successfully',
            data: stats,
        };
    }
    async updateProjectDetails(file, updateData, user) {
        const userId = user.userId || user.id || user._id;
        return this.projectsService.updateProjectByToken(userId, updateData, file);
    }
    async getProjectDetailsByDoctor(projectId, req) {
        const doctorId = req.user.id;
        return await this.projectsService.getProjectDetailsForDoctor(projectId, doctorId);
    }
    async getMyProject(user, view) {
        const userId = user.userId || user.id || user._id;
        return this.projectsService.getMyProject(userId);
    }
    async getAllProjects(query) {
        return this.projectsService.getAllCompletedProjects(query);
    }
    async getProjectDetails(id) {
        return this.projectsService.getProjectById(id);
    }
    async getStats() {
        const stats = await this.projectsService.getProjectsStats();
        return {
            message: 'Statistics retrieved successfully',
            data: stats,
        };
    }
    async getDoctorProjects(req, queryDto) {
        const doctorId = req.user.id;
        return await this.projectsService.getDoctorProjectsWithStats(doctorId, queryDto);
    }
    async deleteProjectFile(fileId, user) {
        const userId = user.userId || user.id || user._id;
        return this.projectsService.deleteProjectFile(fileId, userId);
    }
    async deleteProjectImage(user) {
        const userId = user.userId || user.id || user._id;
        return this.projectsService.deleteProjectImageByToken(userId);
    }
    async updateProjectStatus(projectId, doctorId, updateProjectStatusDto) {
        return await this.projectsService.updateProjectStatus(projectId, doctorId, updateProjectStatusDto);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)('upload-file'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Only PDF, DOC, DOCX, PPT, PPTX files are allowed'), false);
            }
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('description')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "uploadFileToMyProject", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('doctor'),
    (0, common_1.Get)('doctor/stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getDoctorStats", null);
__decorate([
    (0, common_1.Patch)('update-project'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateProjectDetails", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('doctor/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectDetailsByDoctor", null);
__decorate([
    (0, common_1.Get)('my-project'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('view')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getMyProject", null);
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getAllProjects", null);
__decorate([
    (0, common_1.Get)('details/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectDetails", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getStats", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('doctor'),
    (0, common_1.Get)('all/doctor'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getDoctorProjects", null);
__decorate([
    (0, common_1.Delete)('files/:fileId/delete'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "deleteProjectFile", null);
__decorate([
    (0, common_1.Delete)('delete-image'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "deleteProjectImage", null);
__decorate([
    (0, common_1.Patch)('doctor/projects/:projectId/status'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_project_status_dto_1.UpdateProjectStatusDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateProjectStatus", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.Controller)('api/v1/projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map