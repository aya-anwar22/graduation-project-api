import { Document, Types } from 'mongoose';
export type SupervisionRequestDocument = SupervisionRequest & Document;
export declare class SupervisionRequest {
    student_id: Types.ObjectId;
    doctorId: Types.ObjectId;
    departmentId: Types.ObjectId;
    project_name: string;
    project_description: string;
    main_objectives: string;
    year: string;
    project_type: string;
    technologies: string[];
    prerequisites?: string;
    additional_notes?: string;
    status: 'pending' | 'approved' | 'rejected';
    project_id?: Types.ObjectId;
}
export declare const SupervisionRequestSchema: import("mongoose").Schema<SupervisionRequest, import("mongoose").Model<SupervisionRequest, any, any, any, Document<unknown, any, SupervisionRequest, any, {}> & SupervisionRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SupervisionRequest, Document<unknown, {}, import("mongoose").FlatRecord<SupervisionRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<SupervisionRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
