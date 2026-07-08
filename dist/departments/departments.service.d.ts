import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { UniversityDocument } from '../universities/schemas/university.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentsService {
    private departmentModel;
    private universityModel;
    constructor(departmentModel: Model<DepartmentDocument>, universityModel: Model<UniversityDocument>);
    create(createDepartmentDto: CreateDepartmentDto): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, DepartmentDocument, {}, {}> & Department & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, DepartmentDocument, {}, {}> & Department & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
    }>;
    findByUniversity(universityId: string): Promise<{
        message: string;
        university: {
            _id: Types.ObjectId;
            universityName: string;
        };
        data: (import("mongoose").Document<unknown, {}, DepartmentDocument, {}, {}> & Department & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, DepartmentDocument, {}, {}> & Department & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, DepartmentDocument, {}, {}> & Department & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    restore(id: string): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, DepartmentDocument, {}, {}> & Department & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    findAllDeleted(): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, DepartmentDocument, {}, {}> & Department & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
    }>;
    permanentDelete(id: string): Promise<{
        message: string;
    }>;
}
