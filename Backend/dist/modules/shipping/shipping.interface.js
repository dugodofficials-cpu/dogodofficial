"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingStatus = exports.ShippingRateType = exports.ShippingMethodType = exports.ShippingProviderType = void 0;
var ShippingProviderType;
(function (ShippingProviderType) {
    ShippingProviderType["INTERNAL"] = "INTERNAL";
    ShippingProviderType["EXTERNAL"] = "EXTERNAL";
    ShippingProviderType["MARKETPLACE"] = "MARKETPLACE";
})(ShippingProviderType = exports.ShippingProviderType || (exports.ShippingProviderType = {}));
var ShippingMethodType;
(function (ShippingMethodType) {
    ShippingMethodType["STANDARD"] = "STANDARD";
    ShippingMethodType["EXPRESS"] = "EXPRESS";
    ShippingMethodType["OVERNIGHT"] = "OVERNIGHT";
    ShippingMethodType["TWO_DAY"] = "TWO_DAY";
    ShippingMethodType["INTERNATIONAL"] = "INTERNATIONAL";
    ShippingMethodType["LOCAL_PICKUP"] = "LOCAL_PICKUP";
    ShippingMethodType["LOCAL_DELIVERY"] = "LOCAL_DELIVERY";
})(ShippingMethodType = exports.ShippingMethodType || (exports.ShippingMethodType = {}));
var ShippingRateType;
(function (ShippingRateType) {
    ShippingRateType["FLAT"] = "FLAT";
    ShippingRateType["WEIGHT_BASED"] = "WEIGHT_BASED";
    ShippingRateType["PRICE_BASED"] = "PRICE_BASED";
    ShippingRateType["DISTANCE_BASED"] = "DISTANCE_BASED";
    ShippingRateType["DIMENSIONAL"] = "DIMENSIONAL";
})(ShippingRateType = exports.ShippingRateType || (exports.ShippingRateType = {}));
var ShippingStatus;
(function (ShippingStatus) {
    ShippingStatus["PENDING"] = "PENDING";
    ShippingStatus["READY_FOR_PICKUP"] = "READY_FOR_PICKUP";
    ShippingStatus["PICKED_UP"] = "PICKED_UP";
    ShippingStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ShippingStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    ShippingStatus["DELIVERED"] = "DELIVERED";
    ShippingStatus["FAILED_ATTEMPT"] = "FAILED_ATTEMPT";
    ShippingStatus["EXCEPTION"] = "EXCEPTION";
    ShippingStatus["RETURNED"] = "RETURNED";
})(ShippingStatus = exports.ShippingStatus || (exports.ShippingStatus = {}));
//# sourceMappingURL=shipping.interface.js.map