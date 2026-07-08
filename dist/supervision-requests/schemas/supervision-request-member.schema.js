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
exports.SupervisionRequestMemberSchema = exports.SupervisionRequestMember = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let SupervisionRequestMember = class SupervisionRequestMember {
    request_id;
    full_name;
    role;
    university_number;
    contact_email;
    isLeader;
};
exports.SupervisionRequestMember = SupervisionRequestMember;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'SupervisionRequest', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], SupervisionRequestMember.prototype, "request_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SupervisionRequestMember.prototype, "full_name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SupervisionRequestMember.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SupervisionRequestMember.prototype, "university_number", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SupervisionRequestMember.prototype, "contact_email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], SupervisionRequestMember.prototype, "isLeader", void 0);
exports.SupervisionRequestMember = SupervisionRequestMember = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], SupervisionRequestMember);
exports.SupervisionRequestMemberSchema = mongoose_1.SchemaFactory.createForClass(SupervisionRequestMember);
//# sourceMappingURL=supervision-request-member.schema.js.map