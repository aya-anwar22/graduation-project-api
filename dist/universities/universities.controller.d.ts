import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
export declare class UniversitiesController {
    private readonly universitiesService;
    constructor(universitiesService: UniversitiesService);
    create(createUniversityDto: CreateUniversityDto): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/university.schema").UniversityDocument, {}, {}> & import("./schemas/university.schema").University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/university.schema").UniversityDocument, {}, {}> & import("./schemas/university.schema").University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
    }>;
    findAllDeleted(): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/university.schema").UniversityDocument, {}, {}> & import("./schemas/university.schema").University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/university.schema").UniversityDocument, {}, {}> & import("./schemas/university.schema").University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    update(id: string, updateUniversityDto: UpdateUniversityDto): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, import("./schemas/university.schema").UniversityDocument, {}, {}> & import("./schemas/university.schema").University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    restore(id: string): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/university.schema").UniversityDocument, {}, {}> & import("./schemas/university.schema").University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    permanentDelete(id: string): Promise<{
        message: string;
    }>;
}
