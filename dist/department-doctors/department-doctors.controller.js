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
exports.DepartmentDoctorsController = void 0;
const common_1 = require("@nestjs/common");
const department_doctors_service_1 = require("./department-doctors.service");
let DepartmentDoctorsController = class DepartmentDoctorsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async addDoctorToDepartment(body) {
        return this.service.create(body.departmentId, body.doctorId, body.isHead);
    }
    async getDoctorsByDepartment(departmentId) {
        return this.service.findDoctorsByDepartment(departmentId);
    }
};
exports.DepartmentDoctorsController = DepartmentDoctorsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DepartmentDoctorsController.prototype, "addDoctorToDepartment", null);
__decorate([
    (0, common_1.Get)('department/:departmentId'),
    __param(0, (0, common_1.Param)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentDoctorsController.prototype, "getDoctorsByDepartment", null);
exports.DepartmentDoctorsController = DepartmentDoctorsController = __decorate([
    (0, common_1.Controller)('department-doctors'),
    __metadata("design:paramtypes", [department_doctors_service_1.DepartmentDoctorsService])
], DepartmentDoctorsController);
//# sourceMappingURL=department-doctors.controller.js.map