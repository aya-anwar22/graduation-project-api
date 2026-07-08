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
exports.UniversitiesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const university_schema_1 = require("./schemas/university.schema");
let UniversitiesService = class UniversitiesService {
    universityModel;
    constructor(universityModel) {
        this.universityModel = universityModel;
    }
    async create(createUniversityDto) {
        try {
            const { universityName } = createUniversityDto;
            const existingUniversity = await this.universityModel.findOne({
                universityName,
                is_deleted: false,
            });
            if (existingUniversity) {
                throw new common_1.BadRequestException('University with this name already exists');
            }
            const university = new this.universityModel(createUniversityDto);
            const savedUniversity = await university.save();
            return {
                message: 'University created successfully',
                data: savedUniversity,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create university');
        }
    }
    async findAll() {
        try {
            const universities = await this.universityModel
                .find({ is_deleted: false })
                .select('-is_deleted -deleted_at')
                .sort({ createdAt: -1 });
            return {
                message: 'Universities retrieved successfully',
                data: universities,
                count: universities.length,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve universities');
        }
    }
    async findOne(id) {
        try {
            const university = await this.universityModel
                .findOne({ _id: id, is_deleted: false })
                .select('-is_deleted -deleted_at');
            if (!university) {
                throw new common_1.NotFoundException('University not found');
            }
            return {
                message: 'University retrieved successfully',
                data: university,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve university');
        }
    }
    async update(id, updateUniversityDto) {
        try {
            const university = await this.universityModel.findOne({
                _id: id,
                is_deleted: false,
            });
            if (!university) {
                throw new common_1.NotFoundException('University not found');
            }
            if (updateUniversityDto.universityName) {
                const existingUniversity = await this.universityModel.findOne({
                    universityName: updateUniversityDto.universityName,
                    is_deleted: false,
                    _id: { $ne: id },
                });
                if (existingUniversity) {
                    throw new common_1.BadRequestException('University with this name already exists');
                }
            }
            const updatedUniversity = await this.universityModel
                .findByIdAndUpdate(id, updateUniversityDto, { new: true })
                .select('-is_deleted -deleted_at');
            return {
                message: 'University updated successfully',
                data: updatedUniversity,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update university');
        }
    }
    async remove(id) {
        try {
            const university = await this.universityModel.findOne({
                _id: id,
                is_deleted: false,
            });
            if (!university) {
                throw new common_1.NotFoundException('University not found');
            }
            university.is_deleted = true;
            university.deleted_at = new Date();
            await university.save();
            return {
                message: 'University deleted successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete university');
        }
    }
    async restore(id) {
        try {
            const university = await this.universityModel.findOne({
                _id: id,
                is_deleted: true,
            });
            if (!university) {
                throw new common_1.NotFoundException('Deleted university not found');
            }
            university.is_deleted = false;
            await university.save();
            return {
                message: 'University restored successfully',
                data: university,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to restore university');
        }
    }
    async findAllDeleted() {
        try {
            const universities = await this.universityModel
                .find({ is_deleted: true })
                .sort({ deleted_at: -1 });
            return {
                message: 'Deleted universities retrieved successfully',
                data: universities,
                count: universities.length,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to retrieve deleted universities');
        }
    }
    async permanentDelete(id) {
        try {
            const university = await this.universityModel.findByIdAndDelete(id);
            if (!university) {
                throw new common_1.NotFoundException('University not found');
            }
            return {
                message: 'University permanently deleted',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to permanently delete university');
        }
    }
};
exports.UniversitiesService = UniversitiesService;
exports.UniversitiesService = UniversitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(university_schema_1.University.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UniversitiesService);
//# sourceMappingURL=universities.service.js.map