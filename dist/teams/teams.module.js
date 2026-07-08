"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const team_schema_1 = require("./schemas/team.schema");
const team_member_schema_1 = require("./schemas/team-member.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const teams_service_1 = require("./teams.service");
const teams_controller_1 = require("./teams.controller");
let TeamsModule = class TeamsModule {
};
exports.TeamsModule = TeamsModule;
exports.TeamsModule = TeamsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: team_schema_1.Team.name, schema: team_schema_1.TeamSchema },
                { name: team_member_schema_1.TeamMember.name, schema: team_member_schema_1.TeamMemberSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
        ],
        providers: [teams_service_1.TeamsService],
        controllers: [teams_controller_1.TeamsController],
        exports: [teams_service_1.TeamsService, mongoose_1.MongooseModule],
    })
], TeamsModule);
//# sourceMappingURL=teams.module.js.map