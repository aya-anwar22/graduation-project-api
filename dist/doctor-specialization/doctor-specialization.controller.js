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
exports.DoctorSpecializationController = void 0;
const common_1 = require("@nestjs/common");
const doctor_specialization_service_1 = require("./doctor-specialization.service");
const auth_guard_1 = require("../common/guards/auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const update_doctor_specialization_dto_1 = require("./dto/update-doctor-specialization.dto");
let DoctorSpecializationController = class DoctorSpecializationController {
    doctorService;
    constructor(doctorService) {
        this.doctorService = doctorService;
    }
    async getStats(doctorId) {
        return this.doctorService.getDoctorStats(doctorId);
    }
    async getDashboardSummary(doctorId) {
        return this.doctorService.getDetailedDoctorStats(doctorId);
    }
    async getMyStudents(doctorId, departmentId, universityId, page = 1, limit = 10) {
        return this.doctorService.getDoctorStudents(doctorId, { departmentId, universityId }, page, limit);
    }
    async getStudentDetails(studentId) {
        return this.doctorService.getStudentDetailsForDoctor(studentId);
    }
    async getProfile(userId) {
        return this.doctorService.getDoctorProfile(userId);
    }
    async updateProfile(userId, updateData, profileImage) {
        return this.doctorService.updateDoctorProfile(userId, updateData, profileImage);
    }
};
exports.DoctorSpecializationController = DoctorSpecializationController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DoctorSpecializationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('student-summary'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DoctorSpecializationController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Get)('my-students'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('departmentId')),
    __param(2, (0, common_1.Query)('universityId')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], DoctorSpecializationController.prototype, "getMyStudents", null);
__decorate([
    (0, common_1.Get)('student-details/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DoctorSpecializationController.prototype, "getStudentDetails", null);
__decorate([
    (0, common_1.Get)('my-profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DoctorSpecializationController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('update-profile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profileImage')),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_doctor_specialization_dto_1.UpdateDoctorProfileDto, Object]),
    __metadata("design:returntype", Promise)
], DoctorSpecializationController.prototype, "updateProfile", null);
exports.DoctorSpecializationController = DoctorSpecializationController = __decorate([
    (0, common_1.Controller)('api/v1/doctor-specialization'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR),
    __metadata("design:paramtypes", [doctor_specialization_service_1.DoctorSpecializationService])
], DoctorSpecializationController);
//# sourceMappingURL=doctor-specialization.controller.js.map