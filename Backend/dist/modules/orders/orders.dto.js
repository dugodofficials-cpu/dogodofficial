"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrdersQueryDto = exports.UpdateDeliveryStatusDto = exports.UpdateOrderStatusDto = exports.UpdateOrderDto = exports.CreateOrderDto = exports.OrderItemDto = exports.DigitalDeliveryDetailsDto = exports.ShippingDetailsDto = exports.AddressDto = void 0;
const tslib_1 = require("tslib");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const payments_interface_1 = require("../payments/payments.interface");
const orders_interface_1 = require("./orders.interface");
class AddressDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], AddressDto.prototype, "street", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], AddressDto.prototype, "city", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], AddressDto.prototype, "state", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], AddressDto.prototype, "postalCode", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], AddressDto.prototype, "country", void 0);
exports.AddressDto = AddressDto;
class ShippingDetailsDto {
}
tslib_1.__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    tslib_1.__metadata("design:type", AddressDto)
], ShippingDetailsDto.prototype, "address", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ShippingDetailsDto.prototype, "trackingNumber", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(orders_interface_1.Carriers),
    tslib_1.__metadata("design:type", String)
], ShippingDetailsDto.prototype, "carrier", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    tslib_1.__metadata("design:type", Date)
], ShippingDetailsDto.prototype, "estimatedDeliveryDate", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    tslib_1.__metadata("design:type", Date)
], ShippingDetailsDto.prototype, "actualDeliveryDate", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(orders_interface_1.DeliveryStatus),
    tslib_1.__metadata("design:type", String)
], ShippingDetailsDto.prototype, "deliveryStatus", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], ShippingDetailsDto.prototype, "deliveryNotes", void 0);
exports.ShippingDetailsDto = ShippingDetailsDto;
class DigitalDeliveryDetailsDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], DigitalDeliveryDetailsDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], DigitalDeliveryDetailsDto.prototype, "downloadLinks", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], DigitalDeliveryDetailsDto.prototype, "accessKeys", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    tslib_1.__metadata("design:type", Date)
], DigitalDeliveryDetailsDto.prototype, "expiryDate", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], DigitalDeliveryDetailsDto.prototype, "downloadCount", void 0);
exports.DigitalDeliveryDetailsDto = DigitalDeliveryDetailsDto;
class OrderItemDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsMongoId)(),
    tslib_1.__metadata("design:type", String)
], OrderItemDto.prototype, "product", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], OrderItemDto.prototype, "quantity", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], OrderItemDto.prototype, "price", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], OrderItemDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], OrderItemDto.prototype, "selectedOptions", void 0);
exports.OrderItemDto = OrderItemDto;
class CreateOrderDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsMongoId)(),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "user", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => OrderItemDto),
    tslib_1.__metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateOrderDto.prototype, "subtotal", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateOrderDto.prototype, "tax", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateOrderDto.prototype, "shippingCost", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateOrderDto.prototype, "discount", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreateOrderDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(orders_interface_1.OrderStatus),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "paymentStatus", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ShippingDetailsDto),
    tslib_1.__metadata("design:type", ShippingDetailsDto)
], CreateOrderDto.prototype, "shippingDetails", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DigitalDeliveryDetailsDto),
    tslib_1.__metadata("design:type", DigitalDeliveryDetailsDto)
], CreateOrderDto.prototype, "digitalDeliveryDetails", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], CreateOrderDto.prototype, "isGift", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "giftMessage", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateOrderDto.prototype, "couponId", void 0);
exports.CreateOrderDto = CreateOrderDto;
class UpdateOrderDto extends CreateOrderDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    tslib_1.__metadata("design:type", String)
], UpdateOrderDto.prototype, "user", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => OrderItemDto),
    tslib_1.__metadata("design:type", Array)
], UpdateOrderDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdateOrderDto.prototype, "subtotal", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdateOrderDto.prototype, "tax", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdateOrderDto.prototype, "shippingCost", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], UpdateOrderDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(payments_interface_1.PaymentStatus),
    tslib_1.__metadata("design:type", String)
], UpdateOrderDto.prototype, "paymentStatus", void 0);
exports.UpdateOrderDto = UpdateOrderDto;
class UpdateOrderStatusDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(orders_interface_1.OrderStatus),
    tslib_1.__metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(payments_interface_1.PaymentStatus),
    tslib_1.__metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "paymentStatus", void 0);
exports.UpdateOrderStatusDto = UpdateOrderStatusDto;
class UpdateDeliveryStatusDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsEnum)(orders_interface_1.DeliveryStatus),
    tslib_1.__metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "deliveryStatus", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "trackingNumber", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(orders_interface_1.Carriers),
    tslib_1.__metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "carrier", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    tslib_1.__metadata("design:type", Date)
], UpdateDeliveryStatusDto.prototype, "estimatedDeliveryDate", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "deliveryNotes", void 0);
exports.UpdateDeliveryStatusDto = UpdateDeliveryStatusDto;
class GetOrdersQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.includeBundleItems = false;
        this.sortBy = 'orderedAt';
        this.sortOrder = 'desc';
    }
}
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    tslib_1.__metadata("design:type", Number)
], GetOrdersQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    tslib_1.__metadata("design:type", Number)
], GetOrdersQueryDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], GetOrdersQueryDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(orders_interface_1.OrderStatus),
    tslib_1.__metadata("design:type", String)
], GetOrdersQueryDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], GetOrdersQueryDto.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    tslib_1.__metadata("design:type", Date)
], GetOrdersQueryDto.prototype, "startDate", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    tslib_1.__metadata("design:type", Date)
], GetOrdersQueryDto.prototype, "endDate", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    tslib_1.__metadata("design:type", Number)
], GetOrdersQueryDto.prototype, "minTotal", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    tslib_1.__metadata("design:type", Boolean)
], GetOrdersQueryDto.prototype, "includeBundleItems", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    tslib_1.__metadata("design:type", Number)
], GetOrdersQueryDto.prototype, "maxTotal", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], GetOrdersQueryDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    tslib_1.__metadata("design:type", String)
], GetOrdersQueryDto.prototype, "sortOrder", void 0);
exports.GetOrdersQueryDto = GetOrdersQueryDto;
//# sourceMappingURL=orders.dto.js.map