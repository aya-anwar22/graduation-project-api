"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorSpecializationModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const doctor_specialization_controller_1 = require("./doctor-specialization.controller");
const doctor_specialization_service_1 = require("./doctor-specialization.service");
const doctor_specialization_schema_1 = require("./schema/doctor-specialization.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const team_schema_1 = require("../teams/schemas/team.schema");
let DoctorSpecializationModule = class DoctorSpecializationModule {
};
exports.DoctorSpecializationModule = DoctorSpecializationModule;
exports.DoctorSpecializationModule = DoctorSpecializationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: doctor_specialization_schema_1.DoctorProfile.name, schema: doctor_specialization_schema_1.DoctorProfileSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: team_schema_1.Team.name, schema: team_schema_1.TeamSchema },
            ]),
            cloudinary_module_1.CloudinaryModule,
        ],
        controllers: [doctor_specialization_controller_1.DoctorSpecializationController],
        providers: [doctor_specialization_service_1.DoctorSpecializationService],
        exports: [doctor_specialization_service_1.DoctorSpecializationService],
    })
], DoctorSpecializationModule);
//# sourceMappingURL=doctor-specialization.module.js.map