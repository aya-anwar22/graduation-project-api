import { Model, Types } from 'mongoose';
import { SupervisionRequest, SupervisionRequestDocument } from './schemas/supervision-request.schema';
import { SupervisionRequestMemberDocument } from './schemas/supervision-request-member.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { ProjectDocument } from '../projects/schemas/project.schema';
import { DepartmentDocument } from '../departments/schemas/department.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectFileDocument } from 'src/projects/schemas/project-file.schema';
import { ProjectTechnologyDocument } from 'src/projects/schemas/project-technology.schema';
import { EmailService } from 'src/common/email/email.service';
import { TeamsService } from 'src/teams/teams.service';
import { GroupChatsService } from 'src/chats/schemas/group-chats.service';
import { DepartmentDoctorDocument } from 'src/department-doctors/schemas/department-doctor.schema';
import { CreateSupervisionRequestDto } from './dto/create-supervision-request.dto';
import { TeamDocument } from 'src/teams/schemas/team.schema';
import { TeamMemberDocument } from 'src/teams/schemas/team-member.schema';
export declare class SupervisionRequestsService {
    private supervisionRequestModel;
    private requestMemberModel;
    private userModel;
    private projectModel;
    private projectFileModel;
    private projectTechnologyModel;
    private departmentModel;
    private teamModel;
    private teamMemberModel;
    private departmentDoctorModel;
    private emailService;
    private notificationsService;
    private teamsService;
    private groupChatsService;
    constructor(supervisionRequestModel: Model<SupervisionRequestDocument>, requestMemberModel: Model<SupervisionRequestMemberDocument>, userModel: Model<UserDocument>, projectModel: Model<ProjectDocument>, projectFileModel: Model<ProjectFileDocument>, projectTechnologyModel: Model<ProjectTechnologyDocument>, departmentModel: Model<DepartmentDocument>, teamModel: Model<TeamDocument>, teamMemberModel: Model<TeamMemberDocument>, departmentDoctorModel: Model<DepartmentDoctorDocument>, emailService: EmailService, notificationsService: NotificationsService, teamsService: TeamsService, groupChatsService: GroupChatsService);
    createSupervisionRequest(userId: string, createDto: CreateSupervisionRequestDto): Promise<{
        message: string;
        request: import("mongoose").Document<unknown, {}, SupervisionRequestDocument, {}, {}> & SupervisionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getRequestForTeamMember(id: string, userId: string): Promise<{
        team_members: (import("mongoose").FlattenMaps<SupervisionRequestMemberDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        student_id: Types.ObjectId;
        doctorId: Types.ObjectId;
        departmentId: Types.ObjectId;
        project_name: string;
        project_description: string;
        main_objectives: string;
        year: string;
        project_type: string;
        technologies: string[];
        prerequisites?: string | undefined;
        additional_notes?: string | undefined;
        status: "pending" | "approved" | "rejected";
        project_id?: Types.ObjectId | undefined;
        _id: Types.ObjectId;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths> | undefined) => Omit<SupervisionRequestDocument, keyof Paths> & Paths;
        $clearModifiedPaths: () => SupervisionRequestDocument;
        $clone: () => SupervisionRequestDocument;
        $createModifiedPathsSnapshot: () => import("mongoose").ModifiedPathsSnapshot;
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path?: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => SupervisionRequestDocument;
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}, {}> & {
                _id: Types.ObjectId;
            } & {
                __v: number;
            }, any>>(name: string): ModelType;
            <ModelType = Model<any, {}, {}, {}, any, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $restoreModifiedPathsSnapshot: (snapshot: import("mongoose").ModifiedPathsSnapshot) => SupervisionRequestDocument;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): SupervisionRequestDocument;
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): SupervisionRequestDocument;
            (value: string | Record<string, any>): SupervisionRequestDocument;
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string | undefined;
        collection: import("mongoose").FlattenMaps<import("mongoose").Collection<import("bson").Document>>;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => any;
        depopulate: <Paths = {}>(path?: string | string[]) => import("mongoose").MergeType<SupervisionRequestDocument, Paths>;
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}>) => boolean;
        errors?: import("mongoose").Error.ValidationError | undefined;
        get: {
            <T extends string | number | symbol>(path: T, type?: any, options?: any): any;
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<SupervisionRequestDocument>;
        id?: any;
        increment: () => SupervisionRequestDocument;
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => SupervisionRequestDocument;
        invalidate: {
            <T extends string | number | symbol>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends string | number | symbol>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends string | number | symbol>(path?: T | T[] | undefined, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends string | number | symbol>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}, {}> & {
                _id: Types.ObjectId;
            } & {
                __v: number;
            }, any>>(name: string): ModelType;
            <ModelType = Model<any, {}, {}, {}, any, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => SupervisionRequestDocument;
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<SupervisionRequestDocument, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<SupervisionRequestDocument, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, SupervisionRequestDocument, {}, unknown, "find", Record<string, never>>;
        save: (options?: import("mongoose").SaveOptions) => Promise<SupervisionRequestDocument>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<{
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }>>;
        set: {
            <T extends string | number | symbol>(path: T, val: any, type: any, options?: import("mongoose").DocumentSetOptions): SupervisionRequestDocument;
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): SupervisionRequestDocument;
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): SupervisionRequestDocument;
            (value: string | Record<string, any>): SupervisionRequestDocument;
        };
        toJSON: {
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
                flattenObjectIds: true;
            }): Omit<{
                [x: string]: any;
            }, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
                flattenObjectIds: true;
            }): {
                [x: string]: any;
            };
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                flattenObjectIds: true;
            }): {
                [x: string]: any;
                [x: number]: any;
                [x: symbol]: any;
            };
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
            }): Omit<any, "__v">;
            (options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
                flattenObjectIds?: false;
            }): import("mongoose").FlattenMaps<any>;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: false;
            }): import("mongoose").FlattenMaps<any>;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): {
                [x: string]: any;
            };
            (options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
                flattenObjectIds: true;
            }): any;
            <T = any>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
                flattenObjectIds?: false;
            }): import("mongoose").FlattenMaps<T>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: false;
            }): import("mongoose").FlattenMaps<T>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): import("mongoose").ObjectIdToString<import("mongoose").FlattenMaps<T>>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
                flattenObjectIds: true;
            }): import("mongoose").ObjectIdToString<T>;
        };
        toObject: {
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
                flattenObjectIds: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
                flattenObjectIds: true;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                flattenObjectIds: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): any;
            (options?: import("mongoose").ToObjectOptions): any;
            <T>(options?: import("mongoose").ToObjectOptions): import("mongoose").Require_id<T> & {
                __v: number;
            };
        };
        unmarkModified: {
            <T extends string | number | symbol>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<SupervisionRequestDocument> | undefined, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, SupervisionRequestDocument, {}, unknown, "find", Record<string, never>>;
        validate: {
            <T extends string | number | symbol>(pathsToValidate?: T | T[] | undefined, options?: import("mongoose").AnyObject): Promise<void>;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): Promise<void>;
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
            }): Promise<void>;
        };
        validateSync: {
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
                [k: string]: any;
            }): import("mongoose").Error.ValidationError | null;
            <T extends string | number | symbol>(pathsToValidate?: T | T[] | undefined, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        __v: number;
    } | {
        team_members: (import("mongoose").FlattenMaps<SupervisionRequestMemberDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        is_team_leader: boolean;
        student_id: Types.ObjectId;
        doctorId: Types.ObjectId;
        departmentId: Types.ObjectId;
        project_name: string;
        project_description: string;
        main_objectives: string;
        year: string;
        project_type: string;
        technologies: string[];
        prerequisites?: string | undefined;
        additional_notes?: string | undefined;
        status: "pending" | "approved" | "rejected";
        project_id?: Types.ObjectId | undefined;
        _id: Types.ObjectId;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths> | undefined) => Omit<SupervisionRequestDocument, keyof Paths> & Paths;
        $clearModifiedPaths: () => SupervisionRequestDocument;
        $clone: () => SupervisionRequestDocument;
        $createModifiedPathsSnapshot: () => import("mongoose").ModifiedPathsSnapshot;
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path?: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => SupervisionRequestDocument;
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}, {}> & {
                _id: Types.ObjectId;
            } & {
                __v: number;
            }, any>>(name: string): ModelType;
            <ModelType = Model<any, {}, {}, {}, any, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $restoreModifiedPathsSnapshot: (snapshot: import("mongoose").ModifiedPathsSnapshot) => SupervisionRequestDocument;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): SupervisionRequestDocument;
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): SupervisionRequestDocument;
            (value: string | Record<string, any>): SupervisionRequestDocument;
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string | undefined;
        collection: import("mongoose").FlattenMaps<import("mongoose").Collection<import("bson").Document>>;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => any;
        depopulate: <Paths = {}>(path?: string | string[]) => import("mongoose").MergeType<SupervisionRequestDocument, Paths>;
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}>) => boolean;
        errors?: import("mongoose").Error.ValidationError | undefined;
        get: {
            <T extends string | number | symbol>(path: T, type?: any, options?: any): any;
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<SupervisionRequestDocument>;
        id?: any;
        increment: () => SupervisionRequestDocument;
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => SupervisionRequestDocument;
        invalidate: {
            <T extends string | number | symbol>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends string | number | symbol>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends string | number | symbol>(path?: T | T[] | undefined, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends string | number | symbol>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}, {}> & {
                _id: Types.ObjectId;
            } & {
                __v: number;
            }, any>>(name: string): ModelType;
            <ModelType = Model<any, {}, {}, {}, any, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => SupervisionRequestDocument;
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<SupervisionRequestDocument, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<SupervisionRequestDocument, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, SupervisionRequestDocument, {}, unknown, "find", Record<string, never>>;
        save: (options?: import("mongoose").SaveOptions) => Promise<SupervisionRequestDocument>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<{
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }>>;
        set: {
            <T extends string | number | symbol>(path: T, val: any, type: any, options?: import("mongoose").DocumentSetOptions): SupervisionRequestDocument;
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): SupervisionRequestDocument;
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): SupervisionRequestDocument;
            (value: string | Record<string, any>): SupervisionRequestDocument;
        };
        toJSON: {
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
                flattenObjectIds: true;
            }): Omit<{
                [x: string]: any;
            }, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
                flattenObjectIds: true;
            }): {
                [x: string]: any;
            };
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                flattenObjectIds: true;
            }): {
                [x: string]: any;
                [x: number]: any;
                [x: symbol]: any;
            };
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
            }): Omit<any, "__v">;
            (options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
                flattenObjectIds?: false;
            }): import("mongoose").FlattenMaps<any>;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: false;
            }): import("mongoose").FlattenMaps<any>;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): {
                [x: string]: any;
            };
            (options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
                flattenObjectIds: true;
            }): any;
            <T = any>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
                flattenObjectIds?: false;
            }): import("mongoose").FlattenMaps<T>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: false;
            }): import("mongoose").FlattenMaps<T>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): import("mongoose").ObjectIdToString<import("mongoose").FlattenMaps<T>>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
                flattenObjectIds: true;
            }): import("mongoose").ObjectIdToString<T>;
        };
        toObject: {
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
                flattenObjectIds: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
                flattenObjectIds: true;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                flattenObjectIds: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): any;
            (options?: import("mongoose").ToObjectOptions): any;
            <T>(options?: import("mongoose").ToObjectOptions): import("mongoose").Require_id<T> & {
                __v: number;
            };
        };
        unmarkModified: {
            <T extends string | number | symbol>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<SupervisionRequestDocument> | undefined, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, SupervisionRequestDocument, {}, unknown, "find", Record<string, never>>;
        validate: {
            <T extends string | number | symbol>(pathsToValidate?: T | T[] | undefined, options?: import("mongoose").AnyObject): Promise<void>;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): Promise<void>;
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
            }): Promise<void>;
        };
        validateSync: {
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
                [k: string]: any;
            }): import("mongoose").Error.ValidationError | null;
            <T extends string | number | symbol>(pathsToValidate?: T | T[] | undefined, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        __v: number;
    }>;
    updateRequestStatus(requestId: string, doctorId: string, status: 'approved' | 'rejected'): Promise<{
        success: boolean;
        message: string;
    }>;
    getRequestDetails(id: string, doctorId: Types.ObjectId): Promise<{
        team_members: {
            userDetails: {
                _id: Types.ObjectId;
                fullName: string;
                email: string;
                profileImage: string;
                phoneNumber: string;
                bio: string | undefined;
                universityCode: string | undefined;
                isDeleted: boolean;
            } | null;
            request_id: Types.ObjectId;
            full_name: string;
            role: string;
            university_number: string;
            contact_email: string;
            isLeader: boolean;
            _id: Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            id?: any;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
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
        status: "pending" | "approved" | "rejected";
        project_id?: Types.ObjectId;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    getDoctorRequests(doctorId: string, filters: {
        departmentId?: string;
        year?: string;
        universityId?: string;
        status?: string;
    }, page?: number, limit?: number): Promise<{
        success: boolean;
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        data: {
            studentId: any;
            studentName: any;
            projectImage: any;
            requestId: any;
            projectName: any;
            projectDescription: any;
            mainObjectives: any;
            year: any;
            projectType: any;
            technologies: any;
            prerequisites: any;
            additionalNotes: any;
            status: any;
            departmentId: any;
            departmentName: any;
            universityId: any;
            universityName: any;
        }[];
    }>;
    getrequestDetails(requestId: string): Promise<{
        success: boolean;
        data: {
            requestId: any;
            projectName: any;
            projectDescription: any;
            mainObjectives: any;
            year: any;
            projectType: any;
            technologies: any;
            prerequisites: any;
            additionalNotes: any;
            status: any;
            departmentId: any;
            departmentName: any;
            universityId: any;
            universityName: any;
            team: {
                fullName: any;
                role: any;
                universityNumber: any;
                contactEmail: any;
                isLeader: any;
                profileImage: string;
            }[];
        };
    }>;
    getStudentRequests(studentId: Types.ObjectId): Promise<(import("mongoose").Document<unknown, {}, SupervisionRequestDocument, {}, {}> & SupervisionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDoctorRequestStats(doctorId: string): Promise<{
        success: boolean;
        data: {
            totalRequests: number;
            approvedRequests: number;
            pendingRequests: number;
            currentYearRequests: number;
            year: string;
        };
    }>;
}
