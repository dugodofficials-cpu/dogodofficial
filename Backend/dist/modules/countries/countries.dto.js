"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCountriesQueryDto = exports.UpdateCountryDto = exports.CreateCountryDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCountryDto {
    constructor() {
        this.isActive = true;
    }
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], CreateCountryDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(2, 3),
    tslib_1.__metadata("design:type", String)
], CreateCountryDto.prototype, "code", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], CreateCountryDto.prototype, "phoneCode", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3),
    tslib_1.__metadata("design:type", String)
], CreateCountryDto.prototype, "currency", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], CreateCountryDto.prototype, "region", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Object)
], CreateCountryDto.prototype, "isActive", void 0);
exports.CreateCountryDto = CreateCountryDto;
class UpdateCountryDto extends CreateCountryDto {
}
exports.UpdateCountryDto = UpdateCountryDto;
class GetCountriesQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'name';
        this.sortOrder = 'asc';
    }
}
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    tslib_1.__metadata("design:type", Number)
], GetCountriesQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    tslib_1.__metadata("design:type", Number)
], GetCountriesQueryDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], GetCountriesQueryDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], GetCountriesQueryDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    tslib_1.__metadata("design:type", String)
], GetCountriesQueryDto.prototype, "sortOrder", void 0);
exports.GetCountriesQueryDto = GetCountriesQueryDto;
//# sourceMappingURL=countries.dto.js.map