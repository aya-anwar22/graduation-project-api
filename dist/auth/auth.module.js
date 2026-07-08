"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const user_auth_schema_1 = require("./schemas/user-auth.schema");
const user_module_1 = require("../user/user.module");
const jwt_util_1 = require("../common/utils/jwt.util");
const mail_service_1 = require("./mail/mail.service");
const shared_module_1 = require("../common/shared.module");
const university_schema_1 = require("../universities/schemas/university.schema");
const department_schema_1 = require("../departments/schemas/department.schema");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_auth_schema_1.UserAuth.name, schema: user_auth_schema_1.UserAuthSchema },
                { name: 'University', schema: university_schema_1.UniversitySchema },
                { name: 'Department', schema: department_schema_1.DepartmentSchema },
            ]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            shared_module_1.SharedModule,
        ],
        controllers: [auth_controller_1.AuthController, auth_controller_1.AuthV2Controller],
        providers: [auth_service_1.AuthService, jwt_util_1.JwtUtil, mail_service_1.MailService],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map