"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const payments_interface_1 = require("../payments.interface");
const axios_1 = tslib_1.__importStar(require("axios"));
const HttpException_1 = require("../../../exceptions/HttpException");
const logger_1 = require("../../../utils/logger");
class PaystackPaymentProvider {
    constructor(secretKey) {
        this.baseUrl = 'https://api.paystack.co';
        if (!secretKey) {
            throw new Error('Paystack secret key is required');
        }
        this.secretKey = secretKey;
    }
    async makeRequest(method, endpoint, data) {
        var _a, _b, _c, _d, _e;
        try {
            const response = await (0, axios_1.default)({
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json',
                },
                data,
            });
            return response.data;
        }
        catch (error) {
            if (error instanceof axios_1.AxiosError) {
                const errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message;
                logger_1.logger.error(`Paystack API Error: ${errorMessage}`, {
                    endpoint,
                    statusCode: (_c = error.response) === null || _c === void 0 ? void 0 : _c.status,
                    errorData: (_d = error.response) === null || _d === void 0 ? void 0 : _d.data,
                });
                throw new HttpException_1.HttpException(((_e = error.response) === null || _e === void 0 ? void 0 : _e.status) || 500, `Payment provider error: ${errorMessage}`);
            }
            logger_1.logger.error('Unexpected error during Paystack API call:', error);
            throw new HttpException_1.HttpException(500, 'Unexpected error during payment processing');
        }
    }
    async initializePayment(transaction) {
        var _a, _b, _c;
        if (!((_a = transaction.amount) === null || _a === void 0 ? void 0 : _a.value) || !((_b = transaction.customer) === null || _b === void 0 ? void 0 : _b.email)) {
            throw new HttpException_1.HttpException(400, 'Amount and customer email are required');
        }
        const payload = {
            amount: Math.round(transaction.amount.value * 100),
            email: transaction.customer.email,
            reference: transaction.reference,
            callback_url: process.env.PAYSTACK_CALLBACK_URL,
            metadata: Object.assign(Object.assign({}, transaction.metadata), { custom_fields: [
                    {
                        display_name: 'Payment For',
                        variable_name: 'payment_for',
                        value: ((_c = transaction.metadata) === null || _c === void 0 ? void 0 : _c.orderId) || 'Product Purchase',
                    },
                ] }),
            channels: this.getSupportedChannels(),
        };
        return this.makeRequest('POST', '/transaction/initialize', payload);
    }
    async verifyPayment(reference) {
        if (!reference) {
            throw new HttpException_1.HttpException(400, 'Payment reference is required');
        }
        return this.makeRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`);
    }
    async refundPayment(transactionId, amount) {
        if (!transactionId) {
            throw new HttpException_1.HttpException(400, 'Transaction ID is required');
        }
        const payload = {
            transaction: transactionId,
        };
        if (amount) {
            payload.amount = Math.round(amount * 100);
        }
        return this.makeRequest('POST', '/refund', payload);
    }
    mapPaystackStatus(paystackStatus) {
        const statusMap = {
            pending: payments_interface_1.PaymentStatus.PENDING,
            success: payments_interface_1.PaymentStatus.COMPLETED,
            failed: payments_interface_1.PaymentStatus.FAILED,
            abandoned: payments_interface_1.PaymentStatus.CANCELLED,
        };
        return statusMap[paystackStatus.toLowerCase()] || payments_interface_1.PaymentStatus.FAILED;
    }
    getSupportedChannels() {
        return [
            payments_interface_1.PaymentChannel.CARD,
            payments_interface_1.PaymentChannel.BANK,
            payments_interface_1.PaymentChannel.USSD,
            payments_interface_1.PaymentChannel.QR,
            payments_interface_1.PaymentChannel.MOBILE_MONEY,
            payments_interface_1.PaymentChannel.BANK_TRANSFER,
        ];
    }
    getProvider() {
        return payments_interface_1.PaymentProvider.PAYSTACK;
    }
}
exports.default = PaystackPaymentProvider;
//# sourceMappingURL=paystack-provider.js.map