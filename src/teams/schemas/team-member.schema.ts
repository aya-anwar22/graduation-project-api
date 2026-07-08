import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Team } from './team.schema';
import { User } from 'src/user/schemas/user.schema';

export type TeamMemberDocument = TeamMember & Document;

@Schema({ timestamps: true })
export class TeamMember {
  @Prop({ type: Types.ObjectId, ref: Team.name, required: true })
  team_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  role: string;

  @Prop()
  role_description?: string;

  @Prop()
  university_number?: string;

  @Prop()
  contact_email?: string;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
