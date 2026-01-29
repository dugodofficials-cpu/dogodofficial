"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Carriers = exports.DeliveryStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
    OrderStatus["DELETED"] = "DELETED";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["PENDING"] = "PENDING";
    DeliveryStatus["PROCESSING"] = "PROCESSING";
    DeliveryStatus["IN_TRANSIT"] = "IN_TRANSIT";
    DeliveryStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    DeliveryStatus["DELIVERED"] = "DELIVERED";
    DeliveryStatus["FAILED"] = "FAILED";
    DeliveryStatus["RETURNED"] = "RETURNED";
})(DeliveryStatus = exports.DeliveryStatus || (exports.DeliveryStatus = {}));
var Carriers;
(function (Carriers) {
    Carriers["DHL"] = "DHL";
    Carriers["SPEEDAF"] = "SPEEDAF";
    Carriers["GIG"] = "GIG";
    Carriers["CUSTOM"] = "CUSTOM";
})(Carriers = exports.Carriers || (exports.Carriers = {}));
//# sourceMappingURL=orders.interface.js.map