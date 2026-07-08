"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDepartmentDoctorDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_department_doctor_dto_1 = require("./create-department-doctor.dto");
class UpdateDepartmentDoctorDto extends (0, mapped_types_1.PartialType)(create_department_doctor_dto_1.CreateDepartmentDoctorDto) {
}
exports.UpdateDepartmentDoctorDto = UpdateDepartmentDoctorDto;
//# sourceMappingURL=update-department-doctor.dto.js.map