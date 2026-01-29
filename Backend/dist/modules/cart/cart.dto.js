"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShippingMethodDto = exports.ApplyDiscountDto = exports.UpdateItemDto = exports.AddItemDto = exports.UpdateCartDto = exports.CreateCartDto = exports.ShippingEstimateDto = exports.AppliedDiscountDto = exports.CartItemDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const cart_interface_1 = require("./cart.interface");
class CartItemDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsMongoId)(),
    tslib_1.__metadata("design:type", String)
], CartItemDto.prototype, "product", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], CartItemDto.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    tslib_1.__metadata("design:type", Object)
], CartItemDto.prototype, "selectedOptions", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CartItemDto.prototype, "notes", void 0);
exports.CartItemDto = CartItemDto;
class AppliedDiscountDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], AppliedDiscountDto.prototype, "code", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(cart_interface_1.DiscountType),
    tslib_1.__metadata("design:type", String)
], AppliedDiscountDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], AppliedDiscountDto.prototype, "value", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], AppliedDiscountDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    tslib_1.__metadata("design:type", Date)
], AppliedDiscountDto.prototype, "expiresAt", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], AppliedDiscountDto.prototype, "minimumPurchase", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], AppliedDiscountDto.prototype, "maximumDiscount", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    tslib_1.__metadata("design:type", Object)
], AppliedDiscountDto.prototype, "metadata", void 0);
exports.AppliedDiscountDto = AppliedDiscountDto;
class ShippingEstimateDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ShippingEstimateDto.prototype, "provider", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ShippingEstimateDto.prototype, "method", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], ShippingEstimateDto.prototype, "cost", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], ShippingEstimateDto.prototype, "estimatedDays", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], ShippingEstimateDto.prototype, "isAvailable", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], ShippingEstimateDto.prototype, "restrictions", void 0);
exports.ShippingEstimateDto = ShippingEstimateDto;
class CreateCartDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsMongoId)(),
    tslib_1.__metadata("design:type", String)
], CreateCartDto.prototype, "user", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CartItemDto),
    tslib_1.__metadata("design:type", Array)
], CreateCartDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCartDto.prototype, "sessionId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIP)(),
    tslib_1.__metadata("design:type", String)
], CreateCartDto.prototype, "ipAddress", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCartDto.prototype, "userAgent", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    tslib_1.__metadata("design:type", Date)
], CreateCartDto.prototype, "expiresAt", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateCartDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    tslib_1.__metadata("design:type", Object)
], CreateCartDto.prototype, "metadata", void 0);
exports.CreateCartDto = CreateCartDto;
class UpdateCartDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(cart_interface_1.CartStatus),
    tslib_1.__metadata("design:type", String)
], UpdateCartDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateCartDto.prototype, "selectedShippingMethod", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ShippingEstimateDto),
    tslib_1.__metadata("design:type", Array)
], UpdateCartDto.prototype, "shippingEstimates", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateCartDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    tslib_1.__metadata("design:type", Object)
], UpdateCartDto.prototype, "metadata", void 0);
exports.UpdateCartDto = UpdateCartDto;
class AddItemDto {
}
tslib_1.__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CartItemDto),
    tslib_1.__metadata("design:type", CartItemDto)
], AddItemDto.prototype, "item", void 0);
exports.AddItemDto = AddItemDto;
class UpdateItemDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], UpdateItemDto.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    tslib_1.__metadata("design:type", Object)
], UpdateItemDto.prototype, "selectedOptions", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateItemDto.prototype, "notes", void 0);
exports.UpdateItemDto = UpdateItemDto;
class ApplyDiscountDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ApplyDiscountDto.prototype, "code", void 0);
exports.ApplyDiscountDto = ApplyDiscountDto;
class UpdateShippingMethodDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateShippingMethodDto.prototype, "method", void 0);
exports.UpdateShippingMethodDto = UpdateShippingMethodDto;
//# sourceMappingURL=cart.dto.js.map