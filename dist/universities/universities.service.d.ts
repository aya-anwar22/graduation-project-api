import { Model } from 'mongoose';
import { University, UniversityDocument } from './schemas/university.schema';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
export declare class UniversitiesService {
    private universityModel;
    constructor(universityModel: Model<UniversityDocument>);
    create(createUniversityDto: CreateUniversityDto): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, UniversityDocument, {}, {}> & University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    findAll(): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, UniversityDocument, {}, {}> & University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
    }>;
    findOne(id: string): Promise<{
        message: string;
        data: import("mongoose").Document<unknown, {}, UniversityDocument, {}, {}> & University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    update(id: string, updateUniversityDto: UpdateUniversityDto): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, UniversityDocument, {}, {}> & University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
        data: import("mongoose").Document<unknown, {}, UniversityDocument, {}, {}> & University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    findAllDeleted(): Promise<{
        message: string;
        data: (import("mongoose").Document<unknown, {}, UniversityDocument, {}, {}> & University & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        count: number;
    }>;
    permanentDelete(id: string): Promise<{
        message: string;
    }>;
}
