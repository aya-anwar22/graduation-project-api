"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_service_1 = require("./user.service");
const user_controller_1 = require("./user.controller");
const user_schema_1 = require("./schemas/user.schema");
const department_doctors_module_1 = require("../department-doctors/department-doctors.module");
const departments_module_1 = require("../departments/departments.module");
const department_doctor_schema_1 = require("../department-doctors/schemas/department-doctor.schema");
const department_schema_1 = require("../departments/schemas/department.schema");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: 'DepartmentDoctor', schema: department_doctor_schema_1.DepartmentDoctorSchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
            ]),
            (0, common_1.forwardRef)(() => department_doctors_module_1.DepartmentDoctorsModule),
            departments_module_1.DepartmentsModule,
            cloudinary_module_1.CloudinaryModule,
        ],
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService],
        exports: [user_service_1.UserService, mongoose_1.MongooseModule],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map