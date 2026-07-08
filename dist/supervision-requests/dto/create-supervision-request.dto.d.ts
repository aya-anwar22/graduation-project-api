import { CreateTeamMemberDto } from './team-member.dto';
export declare class CreateSupervisionRequestDto {
    project_name: string;
    project_description: string;
    main_objectives: string;
    year: string;
    project_type: string;
    technologies: string[];
    prerequisites?: string;
    additional_notes?: string;
    doctorId: string;
    departmentId: string;
    team_members: CreateTeamMemberDto[];
}
