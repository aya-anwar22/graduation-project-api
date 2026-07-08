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
exports.AdminDashboardController = void 0;
const common_1 = require("@nestjs/common");
const admin_dashboard_service_1 = require("./admin-dashboard.service");
const auth_guard_1 = require("../common/guards/auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
const create_university_dto_1 = require("./dto/create-university.dto");
const update_university_dto_1 = require("./dto/update-university.dto");
const update_department_dto_1 = require("./dto/update-department.dto");
const update_user_admin_dto_1 = require("./dto/update-user-admin.dto");
let AdminDashboardController = class AdminDashboardController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getAllUniversities() {
        return await this.adminService.findAllUniversities();
    }
    async getDepartmentsByUni(universityId) {
        return await this.adminService.findDepartmentsByUniversity(universityId);
    }
    async creatuser(createUserDto) {
        return await this.adminService.createUser(createUserDto);
    }
    async getUniversityDetails(id) {
        return this.adminService.getUniversityDetails(id);
    }
    async getUserDetails(id) {
        return await this.adminService.getUserDetailsById(id);
    }
    async getDetails(id) {
        return await this.adminService.getProjectFullDetails(id);
    }
    async getStats() {
        return this.adminService.getAdminStats();
    }
    async getProjectsByUniversity() {
        return this.adminService.getProjectsDistributionByUniversity();
    }
    async getUniversities(searchTerm, page, limit, isDeleted) {
        const isDeletedFilter = isDeleted === 'true' ? true : isDeleted === 'false' ? false : null;
        return await this.adminService.getAllUniversitiesWithDetails({
            searchTerm,
            isDeletedFilter,
            page: page || 1,
            limit: limit || 10,
        });
    }
    async getStatsDepartment() {
        return await this.adminService.getDepartmentStats();
    }
    async getUniList(departmentId) {
        return this.adminService.getUniversitiesList(departmentId);
    }
    async getDoctorsByUni(universityId) {
        return await this.adminService.getDoctorsByUniversity(universityId);
    }
    async getDepts(query) {
        return await this.adminService.getAllDepartments({
            ...query,
            page: Number(query.page) || 1,
            limit: Number(query.limit) || 10,
        });
    }
    async getDocStats() {
        return await this.adminService.getDoctorStats();
    }
    async getDoctors(searchTerm, departmentId, isHead, academicTitle, status, page, limit) {
        return await this.adminService.getAllDoctorsDetailed({
            searchTerm,
            departmentId,
            isHead,
            academicTitle,
            status,
            page: page || 1,
            limit: limit || 10,
        });
    }
    async getProfile(id) {
        return await this.adminService.getDoctorFullProfile(id);
    }
    async getSummary() {
        return await this.adminService.getProjectsStats();
    }
    async getProjects(page, limit, searchTerm, universityId, departmentId, doctorId, year, status) {
        return await this.adminService.getAllProjectsDetailed({
            page: page || 1,
            limit: limit || 10,
            searchTerm,
            universityId,
            departmentId,
            doctorId,
            year,
            status,
        });
    }
    async getStatsTeam() {
        return await this.adminService.getTeamsStats();
    }
    async getAllTeams(page, limit, searchTerm, universityId, departmentId, doctorId, year) {
        return await this.adminService.getAllTeamsDetailed({
            page: page || 1,
            limit: limit || 10,
            searchTerm,
            universityId,
            departmentId,
            doctorId,
            year,
        });
    }
    async getUsersStats() {
        return await this.adminService.getUsersStatistics();
    }
    async getTeamDetails(id) {
        return await this.adminService.getTeamDetailsById(id);
    }
    async getUsers(page, limit, searchTerm, role, universityId, departmentId, isVerified, status) {
        return await this.adminService.getAllUsersDetailed({
            page: page || 1,
            limit: limit || 10,
            searchTerm,
            role,
            universityId,
            departmentId,
            isVerified,
            status,
        });
    }
    async addUniversity(createUniversityDto) {
        return this.adminService.createUniversity(createUniversityDto);
    }
    async addDepartment(createDto) {
        return await this.adminService.createDepartment(createDto);
    }
    async update(id, dto) {
        return this.adminService.updateUniversity(id, dto);
    }
    async remove(id) {
        return this.adminService.toggleUniversityStatus(id);
    }
    async updateUserData(id, updateDto) {
        return await this.adminService.updateByAdmin(id, updateDto);
    }
    async toggleStatus(id) {
        return await this.adminService.toggleUserStatus(id);
    }
    async updateDept(id, dto) {
        return this.adminService.updateDepartment(id, dto);
    }
    async toggleDeptStatus(id) {
        return this.adminService.toggleDepartmentStatus(id);
    }
};
exports.AdminDashboardController = AdminDashboardController;
__decorate([
    (0, common_1.Get)('universities'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getAllUniversities", null);
__decorate([
    (0, common_1.Get)('departments/:universityId'),
    __param(0, (0, common_1.Param)('universityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getDepartmentsByUni", null);
__decorate([
    (0, common_1.Post)('creatuser'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "creatuser", null);
__decorate([
    (0, common_1.Get)('universities/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getUniversityDetails", null);
__decorate([
    (0, common_1.Get)('user-details/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getUserDetails", null);
__decorate([
    (0, common_1.Get)(':id/details'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getDetails", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('projects-by-university'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getProjectsByUniversity", null);
__decorate([
    (0, common_1.Get)('all-universities'),
    __param(0, (0, common_1.Query)('searchTerm')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('isDeleted')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getUniversities", null);
__decorate([
    (0, common_1.Get)('department-statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getStatsDepartment", null);
__decorate([
    (0, common_1.Get)('universities-list'),
    __param(0, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getUniList", null);
__decorate([
    (0, common_1.Get)('doctors-by-university/:universityId'),
    __param(0, (0, common_1.Param)('universityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getDoctorsByUni", null);
__decorate([
    (0, common_1.Get)('all-department'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getDepts", null);
__decorate([
    (0, common_1.Get)('doctors-stats'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getDocStats", null);
__decorate([
    (0, common_1.Get)('all-doctors-detailed'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('searchTerm')),
    __param(1, (0, common_1.Query)('departmentId')),
    __param(2, (0, common_1.Query)('isHead')),
    __param(3, (0, common_1.Query)('academicTitle')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getDoctors", null);
__decorate([
    (0, common_1.Get)('doctor-profile/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('projects-summary'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('all-projects'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('searchTerm')),
    __param(3, (0, common_1.Query)('universityId')),
    __param(4, (0, common_1.Query)('departmentId')),
    __param(5, (0, common_1.Query)('doctorId')),
    __param(6, (0, common_1.Query)('year')),
    __param(7, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)('teams-statistics'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getStatsTeam", null);
__decorate([
    (0, common_1.Get)('all-teams-detailed'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('searchTerm')),
    __param(3, (0, common_1.Query)('universityId')),
    __param(4, (0, common_1.Query)('departmentId')),
    __param(5, (0, common_1.Query)('doctorId')),
    __param(6, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getAllTeams", null);
__decorate([
    (0, common_1.Get)('users-stats'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getUsersStats", null);
__decorate([
    (0, common_1.Get)('team-details/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getTeamDetails", null);
__decorate([
    (0, common_1.Get)('manage-users'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('searchTerm')),
    __param(3, (0, common_1.Query)('role')),
    __param(4, (0, common_1.Query)('universityId')),
    __param(5, (0, common_1.Query)('departmentId')),
    __param(6, (0, common_1.Query)('isVerified')),
    __param(7, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Post)('universities'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_university_dto_1.CreateUniversityDto]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "addUniversity", null);
__decorate([
    (0, common_1.Post)('create-department'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "addDepartment", null);
__decorate([
    (0, common_1.Patch)('universities/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_university_dto_1.UpdateUniversityDto]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('universities/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('update-role/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_admin_dto_1.UpdateUserAdminDto]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "updateUserData", null);
__decorate([
    (0, common_1.Delete)('toggle-status/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Patch)('departments/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_department_dto_1.UpdateDepartmentDto]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "updateDept", null);
__decorate([
    (0, common_1.Delete)('departments/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDashboardController.prototype, "toggleDeptStatus", null);
exports.AdminDashboardController = AdminDashboardController = __decorate([
    (0, common_1.Controller)('api/v1/admin/dashboard'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_dashboard_service_1.AdminDashboardService])
], AdminDashboardController);
//# sourceMappingURL=admin-dashboard.controller.js.map