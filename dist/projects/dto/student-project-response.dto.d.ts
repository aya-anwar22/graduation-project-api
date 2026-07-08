export declare class StudentProjectResponseDto {
    success: boolean;
    data: {
        project: {
            _id: string;
            title: string;
            description: string;
            year: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
        doctor: {
            _id: string;
            fullName: string;
            email: string;
            phoneNumber: string;
            profileImage?: string;
        };
        team: {
            _id: string;
            name: string;
            code: string;
            leader: {
                _id: string;
                fullName: string;
                email: string;
            };
            members: Array<{
                _id: string;
                fullName: string;
                role: string;
                roleDescription?: string;
                universityNumber?: string;
                contactEmail?: string;
            }>;
        };
        technologies: string[];
        files: Array<{
            _id: string;
            filename: string;
            filepath: string;
            fileType?: string;
            createdAt: Date;
        }>;
        supervisionRequest?: {
            _id: string;
            projectName: string;
            projectDescription: string;
            mainObjectives: string;
            year: string;
            projectType: string;
            status: string;
            createdAt: Date;
        };
    };
}
