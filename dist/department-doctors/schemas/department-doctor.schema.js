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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentDoctorSchema = exports.DepartmentDoctor = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const department_schema_1 = require("../../departments/schemas/department.schema");
const user_schema_1 = require("../../user/schemas/user.schema");
let DepartmentDoctor = class DepartmentDoctor {
    departmentId;
    doctorId;
    isHead;
};
exports.DepartmentDoctor = DepartmentDoctor;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: department_schema_1.Department.name, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DepartmentDoctor.prototype, "departmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: user_schema_1.User.name, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DepartmentDoctor.prototype, "doctorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], DepartmentDoctor.prototype, "isHead", void 0);
exports.DepartmentDoctor = DepartmentDoctor = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DepartmentDoctor);
exports.DepartmentDoctorSchema = mongoose_1.SchemaFactory.createForClass(DepartmentDoctor);
//# sourceMappingURL=department-doctor.schema.js.map