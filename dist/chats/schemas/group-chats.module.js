"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupChatsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const group_chats_service_1 = require("./group-chats.service");
const group_chat_schema_1 = require("./group-chat.schema");
let GroupChatsModule = class GroupChatsModule {
};
exports.GroupChatsModule = GroupChatsModule;
exports.GroupChatsModule = GroupChatsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: group_chat_schema_1.GroupChat.name, schema: group_chat_schema_1.GroupChatSchema },
            ]),
        ],
        providers: [group_chats_service_1.GroupChatsService],
        exports: [group_chats_service_1.GroupChatsService],
    })
], GroupChatsModule);
//# sourceMappingURL=group-chats.module.js.map