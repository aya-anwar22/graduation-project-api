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
exports.GroupChatMessageSchema = exports.GroupChatMessage = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const group_chat_schema_1 = require("./group-chat.schema");
const user_schema_1 = require("../../user/schemas/user.schema");
let GroupChatMessage = class GroupChatMessage {
    chatId;
    senderId;
    message;
    attachments;
};
exports.GroupChatMessage = GroupChatMessage;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: group_chat_schema_1.GroupChat.name, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], GroupChatMessage.prototype, "chatId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: user_schema_1.User.name, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], GroupChatMessage.prototype, "senderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], GroupChatMessage.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Array)
], GroupChatMessage.prototype, "attachments", void 0);
exports.GroupChatMessage = GroupChatMessage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], GroupChatMessage);
exports.GroupChatMessageSchema = mongoose_1.SchemaFactory.createForClass(GroupChatMessage);
//# sourceMappingURL=group-chat-message.schema.js.map