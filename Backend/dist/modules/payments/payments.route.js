"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const payments_controller_1 = tslib_1.__importDefault(require("../../modules/payments/payments.controller"));
class PaymentRoute {
    constructor() {
        this.path = '/payments';
        this.router = (0, express_1.Router)();
        this.paymentController = new payments_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/webhook/paystack`, this.paymentController.handlePaystackWebhook);
    }
}
exports.default = PaymentRoute;
//# sourceMappingURL=payments.route.js.map