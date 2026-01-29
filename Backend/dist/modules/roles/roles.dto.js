"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevokeRoleDto = exports.AssignRoleDto = exports.UpdateRoleDto = exports.CreateRoleDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const roles_interface_1 = require("../../modules/roles/roles.interface");
class CreateRoleDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], CreateRoleDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], CreateRoleDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsEnum)(roles_interface_1.Permission, { each: true }),
    tslib_1.__metadata("design:type", Array)
], CreateRoleDto.prototype, "permissions", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], CreateRoleDto.prototype, "isDefault", void 0);
exports.CreateRoleDto = CreateRoleDto;
class UpdateRoleDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], UpdateRoleDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], UpdateRoleDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsEnum)(roles_interface_1.Permission, { each: true }),
    tslib_1.__metadata("design:type", Array)
], UpdateRoleDto.prototype, "permissions", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], UpdateRoleDto.prototype, "isDefault", void 0);
exports.UpdateRoleDto = UpdateRoleDto;
class AssignRoleDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], AssignRoleDto.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], AssignRoleDto.prototype, "roleId", void 0);
exports.AssignRoleDto = AssignRoleDto;
class RevokeRoleDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], RevokeRoleDto.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], RevokeRoleDto.prototype, "roleId", void 0);
exports.RevokeRoleDto = RevokeRoleDto;
//# sourceMappingURL=roles.dto.js.map