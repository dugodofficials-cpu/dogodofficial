"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAlbumCoverDto = exports.CreateAlbumCoverDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class CreateAlbumCoverDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], CreateAlbumCoverDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", Object)
], CreateAlbumCoverDto.prototype, "image", void 0);
exports.CreateAlbumCoverDto = CreateAlbumCoverDto;
class UpdateAlbumCoverDto extends CreateAlbumCoverDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateAlbumCoverDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], UpdateAlbumCoverDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Object)
], UpdateAlbumCoverDto.prototype, "image", void 0);
exports.UpdateAlbumCoverDto = UpdateAlbumCoverDto;
//# sourceMappingURL=album-covers.dto.js.map