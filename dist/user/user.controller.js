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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const update_student_profile_dto_1 = require("./dto/update-student-profile.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const auth_guard_1 = require("../common/guards/auth.guard");
const image_file_interceptor_1 = require("../common/interceptors/image-file.interceptor");
const make_doctor_dto_1 = require("./dto/make-doctor.dto");
const create_user_admin_dto_1 = require("./dto/create-user-admin.dto");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async getMyProfile(userId) {
        return this.userService.getMyProfile(userId);
    }
    async updateMyProfile(userId, updateData, profileImage) {
        console.log('📝 Received update data:', updateData);
        return this.userService.updateMyProfile(userId, updateData, profileImage);
    }
    makeDoctor(makeDoctorDto) {
        return this.userService.makeDoctor(makeDoctorDto.userId, makeDoctorDto.departmentId);
    }
    findDoctorsByDepartment(departmentId) {
        return this.userService.findDoctorsByDepartment(departmentId);
    }
    async adminCreateUser(createUserDto) {
        return this.userService.createUserByAdmin(createUserDto);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, image_file_interceptor_1.ImageFileInterceptor)('profileImage')),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_student_profile_dto_1.UpdateStudentProfileDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Post)('make-doctor'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [make_doctor_dto_1.MakeDoctorDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "makeDoctor", null);
__decorate([
    (0, common_1.Get)('doctors/:departmentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findDoctorsByDepartment", null);
__decorate([
    (0, common_1.Post)('admin/create-user'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_admin_dto_1.CreateUserAdminDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "adminCreateUser", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('api/v1/users'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map