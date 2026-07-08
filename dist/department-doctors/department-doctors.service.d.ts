import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/user/schemas/user.schema';
import { Department } from 'src/departments/schemas/department.schema';
import { DepartmentDoctor, DepartmentDoctorDocument } from './schemas/department-doctor.schema';
export declare class DepartmentDoctorsService {
    private doctorModel;
    private userModel;
    private departmentModel;
    constructor(doctorModel: Model<DepartmentDoctorDocument>, userModel: Model<UserDocument>, departmentModel: Model<Department>);
    create(departmentId: string, doctorId: string, isHead?: boolean): Promise<import("mongoose").Document<unknown, {}, DepartmentDoctorDocument, {}, {}> & DepartmentDoctor & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findDoctorsByDepartment(departmentId: string): Promise<(import("mongoose").Document<unknown, {}, DepartmentDoctorDocument, {}, {}> & DepartmentDoctor & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
