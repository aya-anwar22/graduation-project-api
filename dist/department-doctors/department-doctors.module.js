"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentDoctorsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const department_doctors_service_1 = require("./department-doctors.service");
const department_doctors_controller_1 = require("./department-doctors.controller");
const department_doctor_schema_1 = require("./schemas/department-doctor.schema");
const user_module_1 = require("../user/user.module");
const departments_module_1 = require("../departments/departments.module");
let DepartmentDoctorsModule = class DepartmentDoctorsModule {
};
exports.DepartmentDoctorsModule = DepartmentDoctorsModule;
exports.DepartmentDoctorsModule = DepartmentDoctorsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: department_doctor_schema_1.DepartmentDoctor.name, schema: department_doctor_schema_1.DepartmentDoctorSchema },
            ]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => departments_module_1.DepartmentsModule),
        ],
        controllers: [department_doctors_controller_1.DepartmentDoctorsController],
        providers: [department_doctors_service_1.DepartmentDoctorsService],
        exports: [department_doctors_service_1.DepartmentDoctorsService, mongoose_1.MongooseModule],
    })
], DepartmentDoctorsModule);
//# sourceMappingURL=department-doctors.module.js.map