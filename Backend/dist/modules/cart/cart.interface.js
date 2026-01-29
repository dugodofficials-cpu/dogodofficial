"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountType = exports.CartStatus = void 0;
var CartStatus;
(function (CartStatus) {
    CartStatus["ACTIVE"] = "ACTIVE";
    CartStatus["CHECKOUT_IN_PROGRESS"] = "CHECKOUT_IN_PROGRESS";
    CartStatus["CONVERTED_TO_ORDER"] = "CONVERTED_TO_ORDER";
    CartStatus["ABANDONED"] = "ABANDONED";
    CartStatus["EXPIRED"] = "EXPIRED";
})(CartStatus = exports.CartStatus || (exports.CartStatus = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
    DiscountType["FIXED_AMOUNT"] = "FIXED_AMOUNT";
    DiscountType["BUY_X_GET_Y"] = "BUY_X_GET_Y";
    DiscountType["FREE_SHIPPING"] = "FREE_SHIPPING";
})(DiscountType = exports.DiscountType || (exports.DiscountType = {}));
//# sourceMappingURL=cart.interface.js.map