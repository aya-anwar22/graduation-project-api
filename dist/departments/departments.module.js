"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const departments_service_1 = require("./departments.service");
const departments_controller_1 = require("./departments.controller");
const department_schema_1 = require("./schemas/department.schema");
const university_schema_1 = require("../universities/schemas/university.schema");
let DepartmentsModule = class DepartmentsModule {
};
exports.DepartmentsModule = DepartmentsModule;
exports.DepartmentsModule = DepartmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: university_schema_1.University.name, schema: university_schema_1.UniversitySchema },
            ]),
        ],
        controllers: [departments_controller_1.DepartmentsController],
        providers: [departments_service_1.DepartmentsService],
        exports: [departments_service_1.DepartmentsService],
    })
], DepartmentsModule);
//# sourceMappingURL=departments.module.js.map