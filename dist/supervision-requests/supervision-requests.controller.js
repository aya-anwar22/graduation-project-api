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
exports.SupervisionRequestsController = void 0;
const common_1 = require("@nestjs/common");
const supervision_requests_service_1 = require("./supervision-requests.service");
const create_supervision_request_dto_1 = require("./dto/create-supervision-request.dto");
const user_schema_1 = require("../user/schemas/user.schema");
const auth_guard_1 = require("../common/guards/auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let SupervisionRequestsController = class SupervisionRequestsController {
    supervisionRequestsService;
    constructor(supervisionRequestsService) {
        this.supervisionRequestsService = supervisionRequestsService;
    }
    async createRequest(userId, createDto) {
        return this.supervisionRequestsService.createSupervisionRequest(userId, createDto);
    }
    async updateStatus(requestId, status, req) {
        return await this.supervisionRequestsService.updateRequestStatus(requestId, req.user.id, status);
    }
    async getSingleRequestDetails(id) {
        return await this.supervisionRequestsService.getrequestDetails(id);
    }
    async getRequestStats(user) {
        const doctorId = user.id || user.userId || user._id;
        return this.supervisionRequestsService.getDoctorRequestStats(doctorId);
    }
    async getById(requestId, req) {
        const userId = req.user.id;
        return this.supervisionRequestsService.getRequestForTeamMember(requestId, userId);
    }
    async getRequestDetails(req, id) {
        return this.supervisionRequestsService.getRequestDetails(id, req.user.userId);
    }
    async getRequests(req, status, departmentId, year, universityId, page = 1, limit = 10) {
        const doctorId = req.user.id;
        return await this.supervisionRequestsService.getDoctorRequests(doctorId, { departmentId, year, universityId, status }, page, limit);
    }
    async getStudentRequests(req) {
        return this.supervisionRequestsService.getStudentRequests(req.user.userId);
    }
};
exports.SupervisionRequestsController = SupervisionRequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_supervision_request_dto_1.CreateSupervisionRequestDto]),
    __metadata("design:returntype", Promise)
], SupervisionRequestsController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Patch)('doctor/update-status/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SupervisionRequestsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('doctor/details/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupervisionRequestsController.prototype, "getSingleRequestDetails", null);
__decorate([
    (0, common_1.Get)('doctor/request-stats'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupervisionRequestsController.prototype, "getRequestStats", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupervisionRequestsController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.DOCTOR),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SupervisionRequestsController.prototype, "getRequestDetails", null);
__decorate([
    (0, common_1.Get)('doctor/pending-requests'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('departmentId')),
    __param(3, (0, common_1.Query)('year')),
    __param(4, (0, common_1.Query)('universityId')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], SupervisionRequestsController.prototype, "getRequests", null);
__decorate([
    (0, common_1.Get)('student/my-requests'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.STUDENT),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupervisionRequestsController.prototype, "getStudentRequests", null);
exports.SupervisionRequestsController = SupervisionRequestsController = __decorate([
    (0, common_1.Controller)('api/v1/supervision-requests'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [supervision_requests_service_1.SupervisionRequestsService])
], SupervisionRequestsController);
//# sourceMappingURL=supervision-requests.controller.js.map