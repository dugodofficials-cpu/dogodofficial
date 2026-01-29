"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCountdownsQueryDto = exports.UpdateCountdownDto = exports.CreateCountdownDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const countdown_interface_1 = require("../../modules/countdown/countdown.interface");
class CreateCountdownDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "launchDate", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(Object.values(countdown_interface_1.CountdownStatus)),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return value;
    }),
    tslib_1.__metadata("design:type", Boolean)
], CreateCountdownDto.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "backgroundImage", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "backgroundColor", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "textColor", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "buttonText", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "buttonColor", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "buttonTextColor", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return value;
    }),
    tslib_1.__metadata("design:type", Boolean)
], CreateCountdownDto.prototype, "showDays", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return value;
    }),
    tslib_1.__metadata("design:type", Boolean)
], CreateCountdownDto.prototype, "showHours", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return value;
    }),
    tslib_1.__metadata("design:type", Boolean)
], CreateCountdownDto.prototype, "showMinutes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return value;
    }),
    tslib_1.__metadata("design:type", Boolean)
], CreateCountdownDto.prototype, "showSeconds", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "timezone", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCountdownDto.prototype, "customMessage", void 0);
exports.CreateCountdownDto = CreateCountdownDto;
class UpdateCountdownDto extends CreateCountdownDto {
}
exports.UpdateCountdownDto = UpdateCountdownDto;
class GetCountdownsQueryDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    tslib_1.__metadata("design:type", Number)
], GetCountdownsQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    tslib_1.__metadata("design:type", Number)
], GetCountdownsQueryDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['title', 'launchDate', 'status', 'createdAt', 'updatedAt']),
    tslib_1.__metadata("design:type", String)
], GetCountdownsQueryDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    tslib_1.__metadata("design:type", String)
], GetCountdownsQueryDto.prototype, "sortOrder", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(Object.values(countdown_interface_1.CountdownStatus)),
    tslib_1.__metadata("design:type", String)
], GetCountdownsQueryDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return value;
    }),
    tslib_1.__metadata("design:type", Boolean)
], GetCountdownsQueryDto.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], GetCountdownsQueryDto.prototype, "search", void 0);
exports.GetCountdownsQueryDto = GetCountdownsQueryDto;
//# sourceMappingURL=countdown.dto.js.map