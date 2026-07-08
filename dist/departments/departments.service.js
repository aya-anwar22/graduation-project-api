"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const department_schema_1 = require("./schemas/department.schema");
const university_schema_1 = require("../universities/schemas/university.schema");
let DepartmentsService = class DepartmentsService {
    departmentModel;
    universityModel;
    constructor(departmentModel, universityModel) {
        this.departmentModel = departmentModel;
        this.universityModel = universityModel;
    }
    async create(createDepartmentDto) {
        try {
            const { departmentName, universityId } = createDepartmentDto;
            const university = await this.universityModel.findOne({
                _id: universityId,
                is_deleted: false,
            });
            if (!university) {
                throw new common_1.NotFoundException('University not found');
            }
            const existingDepartment = await this.departmentModel.findOne({
                departmentName,
                universityId,
                is_deleted: false,
            });
            if (existingDepartment) {
                throw new common_1.BadRequestException('Department with this name already exists in this university');
            }
            const department = new this.departmentModel({
                departmentName,
                universityId: new mongoose_2.Types.ObjectId(universityId),
            });
            const savedDepartment = await department.save();
            await savedDepartment.populate('universityId', 'universityName location');
            return {
                message: 'Department created successfully',
                data: savedDepartment,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create department');
        }
    }
    async findAll() {
        try {
            const departments = await this.departmentModel
                .find({ is_deleted: false })
                .populate('universityId', 'universityName location')
                .select('-is_deleted -deleted_at')
                .sort({ createdAt: -1 });
            return {
                message: 'Departments retrieved successfully',
                data: departments,
                count: departments.length,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve departments');
        }
    }
    async findByUniversity(universityId) {
        try {
            const university = await this.universityModel.findOne({
                _id: universityId,
                is_deleted: false,
            });
            if (!university) {
                throw new common_1.NotFoundException('University not found');
            }
            const departments = await this.departmentModel
                .find({ universityId, is_deleted: false })
                .populate('universityId', 'universityName location')
                .select('-is_deleted -deleted_at')
                .sort({ departmentName: 1 });
            return {
                message: 'Departments retrieved successfully',
                university: {
                    _id: university._id,
                    universityName: university.universityName,
                },
                data: departments,
                count: departments.length,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve departments');
        }
    }
    async findOne(id) {
        try {
            const department = await this.departmentModel
                .findOne({ _id: id, is_deleted: false })
                .populate('universityId', 'universityName location email_contact')
                .select('-is_deleted -deleted_at');
            if (!department) {
                throw new common_1.NotFoundException('Department not found');
            }
            return {
                message: 'Department retrieved successfully',
                data: department,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve department');
        }
    }
    async update(id, updateDepartmentDto) {
        console.log('DONEEE');
        try {
            const department = await this.departmentModel.findOne({
                _id: id,
                is_deleted: false,
            });
            if (!department) {
                throw new common_1.NotFoundException('Department not found');
            }
            const { departmentName, universityId, headDoctorId } = updateDepartmentDto;
            if (universityId) {
                const university = await this.universityModel.findOne({
                    _id: universityId,
                    is_deleted: false,
                });
                if (!university) {
                    throw new common_1.NotFoundException('University not found');
                }
            }
            if (departmentName) {
                const existingDepartment = await this.departmentModel.findOne({
                    departmentName,
                    universityId: universityId || department.universityId,
                    is_deleted: false,
                    _id: { $ne: id },
                });
                if (existingDepartment) {
                    throw new common_1.BadRequestException('Department with this name already exists in this university');
                }
            }
            const updateData = {};
            if (departmentName)
                updateData.departmentName = departmentName;
            if (universityId)
                updateData.universityId = universityId;
            if (headDoctorId)
                updateData.headDoctorId = headDoctorId;
            const updatedDepartment = await this.departmentModel
                .findByIdAndUpdate(id, updateData, { new: true })
                .populate('universityId', 'universityName location')
                .populate('headDoctorId', 'name email')
                .select('-is_deleted -deleted_at');
            return {
                message: 'Department updated successfully',
                data: updatedDepartment,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update department');
        }
    }
    async remove(id) {
        try {
            const department = await this.departmentModel.findOne({
                _id: id,
                is_deleted: false,
            });
            if (!department) {
                throw new common_1.NotFoundException('Department not found');
            }
            department.is_deleted = true;
            department.deleted_at = new Date();
            await department.save();
            return {
                message: 'Department deleted successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete department');
        }
    }
    async restore(id) {
        try {
            const department = await this.departmentModel.findOne({
                _id: id,
                is_deleted: true,
            });
            if (!department) {
                throw new common_1.NotFoundException('Deleted department not found');
            }
            department.is_deleted = false;
            department.deleted_at = undefined;
            await department.save();
            await department.populate('universityId', 'universityName location');
            return {
                message: 'Department restored successfully',
                data: department,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to restore department');
        }
    }
    async findAllDeleted() {
        try {
            const departments = await this.departmentModel
                .find({ is_deleted: true })
                .populate('universityId', 'universityName location')
                .sort({ deleted_at: -1 });
            return {
                message: 'Deleted departments retrieved successfully',
                data: departments,
                count: departments.length,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve deleted departments');
        }
    }
    async permanentDelete(id) {
        try {
            const department = await this.departmentModel.findByIdAndDelete(id);
            if (!department) {
                throw new common_1.NotFoundException('Department not found');
            }
            return {
                message: 'Department permanently deleted',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to permanently delete department');
        }
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __param(1, (0, mongoose_1.InjectModel)(university_schema_1.University.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map