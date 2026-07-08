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
exports.DepartmentDoctorsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../user/schemas/user.schema");
const department_schema_1 = require("../departments/schemas/department.schema");
const department_doctor_schema_1 = require("./schemas/department-doctor.schema");
let DepartmentDoctorsService = class DepartmentDoctorsService {
    doctorModel;
    userModel;
    departmentModel;
    constructor(doctorModel, userModel, departmentModel) {
        this.doctorModel = doctorModel;
        this.userModel = userModel;
        this.departmentModel = departmentModel;
    }
    async create(departmentId, doctorId, isHead = false) {
        const department = await this.departmentModel.findById(departmentId);
        if (!department)
            throw new common_1.BadRequestException('Department not found');
        const doctor = await this.userModel.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor')
            throw new common_1.BadRequestException('Doctor not found');
        const newRelation = new this.doctorModel({
            departmentId: new mongoose_2.Types.ObjectId(departmentId),
            doctorId: new mongoose_2.Types.ObjectId(doctorId),
            isHead,
        });
        return newRelation.save();
    }
    async findDoctorsByDepartment(departmentId) {
        return this.doctorModel
            .find({ departmentId })
            .populate('doctorId', 'fullName email role')
            .exec();
    }
};
exports.DepartmentDoctorsService = DepartmentDoctorsService;
exports.DepartmentDoctorsService = DepartmentDoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(department_doctor_schema_1.DepartmentDoctor.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DepartmentDoctorsService);
//# sourceMappingURL=department-doctors.service.js.map