import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Project } from 'src/projects/schemas/project.schema';
import { SupervisionRequest } from 'src/supervision-requests/schemas/supervision-request.schema';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  type: 'system' | 'user';

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  actor_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  recipient_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Project.name })
  project_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: SupervisionRequest.name })
  supervision_request_id?: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
