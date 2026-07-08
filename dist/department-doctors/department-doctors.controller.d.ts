import { DepartmentDoctorsService } from './department-doctors.service';
export declare class DepartmentDoctorsController {
    private readonly service;
    constructor(service: DepartmentDoctorsService);
    addDoctorToDepartment(body: {
        departmentId: string;
        doctorId: string;
        isHead?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/department-doctor.schema").DepartmentDoctorDocument, {}, {}> & import("./schemas/department-doctor.schema").DepartmentDoctor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getDoctorsByDepartment(departmentId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/department-doctor.schema").DepartmentDoctorDocument, {}, {}> & import("./schemas/department-doctor.schema").DepartmentDoctor & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
