"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPaymentChannel = exports.isPaymentProvider = exports.isPaymentStatus = exports.PaymentChannel = exports.PaymentProvider = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["PARTIALLY_REFUNDED"] = "partially_refunded";
    PaymentStatus["CANCELLED"] = "cancelled";
})(PaymentStatus = exports.PaymentStatus || (exports.PaymentStatus = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["PAYSTACK"] = "paystack";
})(PaymentProvider = exports.PaymentProvider || (exports.PaymentProvider = {}));
var PaymentChannel;
(function (PaymentChannel) {
    PaymentChannel["CARD"] = "card";
    PaymentChannel["BANK"] = "bank";
    PaymentChannel["USSD"] = "ussd";
    PaymentChannel["QR"] = "qr";
    PaymentChannel["MOBILE_MONEY"] = "mobile_money";
    PaymentChannel["BANK_TRANSFER"] = "bank_transfer";
})(PaymentChannel = exports.PaymentChannel || (exports.PaymentChannel = {}));
function isPaymentStatus(value) {
    return Object.values(PaymentStatus).includes(value);
}
exports.isPaymentStatus = isPaymentStatus;
function isPaymentProvider(value) {
    return Object.values(PaymentProvider).includes(value);
}
exports.isPaymentProvider = isPaymentProvider;
function isPaymentChannel(value) {
    return Object.values(PaymentChannel).includes(value);
}
exports.isPaymentChannel = isPaymentChannel;
//# sourceMappingURL=payments.interface.js.map