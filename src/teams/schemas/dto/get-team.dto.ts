import { IsMongoId } from 'class-validator';

export class GetTeamDto {
  @IsMongoId()
  teamId: string;
}
