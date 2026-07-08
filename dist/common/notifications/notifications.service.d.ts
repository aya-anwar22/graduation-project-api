import { Model, Types } from 'mongoose';
import { NotificationDocument } from "../../notifications/schemas/notification.schema";
export declare class NotificationsService {
    private notificationModel;
    constructor(notificationModel: Model<NotificationDocument>);
    createSupervisionNotification(actorId: Types.ObjectId, recipientId: Types.ObjectId, projectId: Types.ObjectId, supervisionRequestId: Types.ObjectId, status: 'approved' | 'rejected', projectName: string): Promise<void>;
    createBulkNotifications(actorId: Types.ObjectId, recipientIds: Types.ObjectId[], projectId: Types.ObjectId, supervisionRequestId: Types.ObjectId, status: 'approved' | 'rejected', projectName: string): Promise<void>;
}
