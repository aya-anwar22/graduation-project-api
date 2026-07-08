import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { University, UniversityDocument } from './schemas/university.schema';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectModel(University.name)
    private universityModel: Model<UniversityDocument>,
  ) {}

  async create(createUniversityDto: CreateUniversityDto) {
    try {
      const { universityName } = createUniversityDto;

      const existingUniversity = await this.universityModel.findOne({
        universityName,
        is_deleted: false,
      });

      if (existingUniversity) {
        throw new BadRequestException(
          'University with this name already exists',
        );
      }

      const university = new this.universityModel(createUniversityDto);
      const savedUniversity = await university.save();

      return {
        message: 'University created successfully',
        data: savedUniversity,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create university');
    }
  }
  // Get All Universities
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
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve universities');
    }
  }
  // Get University by ID
  async findOne(id: string) {
    try {
      const university = await this.universityModel
        .findOne({ _id: id, is_deleted: false })
        .select('-is_deleted -deleted_at');

      if (!university) {
        throw new NotFoundException('University not found');
      }
      return {
        message: 'University retrieved successfully',
        data: university,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve university');
    }
  }

  // Update University
  async update(id: string, updateUniversityDto: UpdateUniversityDto) {
    try {
      const university = await this.universityModel.findOne({
        _id: id,
        is_deleted: false,
      });

      if (!university) {
        throw new NotFoundException('University not found');
      }

      if (updateUniversityDto.universityName) {
        const existingUniversity = await this.universityModel.findOne({
          universityName: updateUniversityDto.universityName,
          is_deleted: false,
          _id: { $ne: id },
        });

        if (existingUniversity) {
          throw new BadRequestException(
            'University with this name already exists',
          );
        }
      }

      const updatedUniversity = await this.universityModel
        .findByIdAndUpdate(id, updateUniversityDto, { new: true })
        .select('-is_deleted -deleted_at');

      return {
        message: 'University updated successfully',
        data: updatedUniversity,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update university');
    }
  }

  // Soft Delete University
  async remove(id: string) {
    try {
      const university = await this.universityModel.findOne({
        _id: id,
        is_deleted: false,
      });

      if (!university) {
        throw new NotFoundException('University not found');
      }

      university.is_deleted = true;
      university.deleted_at = new Date();
      await university.save();

      return {
        message: 'University deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete university');
    }
  }

  // Restore Deleted University
  async restore(id: string) {
    try {
      const university = await this.universityModel.findOne({
        _id: id,
        is_deleted: true,
      });

      if (!university) {
        throw new NotFoundException('Deleted university not found');
      }

      university.is_deleted = false;
      await university.save();

      return {
        message: 'University restored successfully',
        data: university,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to restore university');
    }
  }

  // Get All Deleted Universities (for admin)
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
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve deleted universities',
      );
    }
  }

  // Permanent Delete (for admin only)
  async permanentDelete(id: string) {
    try {
      const university = await this.universityModel.findByIdAndDelete(id);

      if (!university) {
        throw new NotFoundException('University not found');
      }

      return {
        message: 'University permanently deleted',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to permanently delete university',
      );
    }
  }
}
