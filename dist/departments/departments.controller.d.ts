import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    update(id: string, updateDepartmentDto: UpdateDepartmentDto): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, {}> & import("./schemas/department.schema").Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    create(createDepartmentDto: CreateDepartmentDto): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, {}> & import("./schemas/department.schema").Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, {}> & import("./schemas/department.schema").Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
    }>;
    findAllDeleted(): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, {}> & import("./schemas/department.schema").Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
    }>;
    findByUniversity(universityId: string): Promise<{
        message: string;
        university: {
            _id: import("mongoose").Types.ObjectId;
            universityName: string;
        };
        data: (import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, {}> & import("./schemas/department.schema").Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, {}> & import("./schemas/department.schema").Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    restore(id: string): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/department.schema").DepartmentDocument, {}, {}> & import("./schemas/department.schema").Department & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    permanentDelete(id: string): Promise<{
        message: string;
    }>;
}
