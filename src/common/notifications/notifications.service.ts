import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationDocument } from 'src/notifications/schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createSupervisionNotification(
    actorId: Types.ObjectId,
    recipientId: Types.ObjectId,
    projectId: Types.ObjectId,
    supervisionRequestId: Types.ObjectId,
    status: 'approved' | 'rejected',
    projectName: string,
  ) {
    const title =
      status === 'approved' ? 'تم قبول طلب الإشراف' : 'تم رفض طلب الإشراف';

    const message =
      status === 'approved'
        ? `تم قبول طلبك للإشراف على مشروع: ${projectName}`
        : `تم رفض طلبك للإشراف على مشروع: ${projectName}`;

    await this.notificationModel.create({
      title,
      message,
      type: 'system',
      actor_id: actorId,
      recipient_id: recipientId,
      project_id: projectId,
      supervision_request_id: supervisionRequestId,
    });
  }

  async createBulkNotifications(
    actorId: Types.ObjectId,
    recipientIds: Types.ObjectId[],
    projectId: Types.ObjectId,
    supervisionRequestId: Types.ObjectId,
    status: 'approved' | 'rejected',
    projectName: string,
  ) {
    const notifications = recipientIds.map((recipientId) => ({
      title:
        status === 'approved' ? 'تم قبول طلب الإشراف' : 'تم رفض طلب الإشراف',
      message:
        status === 'approved'
          ? `تم قبول طلبكم للإشراف على مشروع: ${projectName}`
          : `تم رفض طلبكم للإشراف على مشروع: ${projectName}`,
      type: 'system' as const,
      actor_id: actorId,
      recipient_id: recipientId,
      project_id: projectId,
      supervision_request_id: supervisionRequestId,
    }));

    await this.notificationModel.insertMany(notifications);
  }
}
