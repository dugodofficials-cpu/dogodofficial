"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const tslib_1 = require("tslib");
const orders_model_1 = tslib_1.__importDefault(require("../../modules/orders/orders.model"));
const payments_interface_1 = require("../../modules/payments/payments.interface");
const payments_model_1 = require("../../modules/payments/payments.model");
const HttpException_1 = require("../../exceptions/HttpException");
const util_1 = require("../../utils/util");
const uuid_1 = require("uuid");
const paystack_provider_1 = tslib_1.__importDefault(require("./integrations/paystack-provider"));
class PaymentService {
    constructor() {
        this.payments = payments_model_1.PaymentModel;
        this.transactions = payments_model_1.PaymentTransactionModel;
        this.refunds = payments_model_1.PaymentRefundModel;
        this.paystackProvider = new paystack_provider_1.default(process.env.PAYSTACK_SECRET_KEY);
    }
    async findAllPayments() {
        const payments = await this.payments.find().populate('user').populate('order');
        return payments;
    }
    async findPaymentById(paymentId) {
        if ((0, util_1.isEmpty)(paymentId))
            throw new HttpException_1.HttpException(400, 'PaymentId is empty');
        const findPayment = await this.payments.findOne({ _id: paymentId }).populate('user').populate('order');
        if (!findPayment)
            throw new HttpException_1.HttpException(409, "Payment doesn't exist");
        return findPayment;
    }
    async findPaymentByTransactionId(transactionId) {
        if ((0, util_1.isEmpty)(transactionId))
            throw new HttpException_1.HttpException(400, 'TransactionId is empty');
        const findPayment = await this.payments.findOne({ 'paymentDetails.transactionId': transactionId }).populate('user').populate('order');
        if (!findPayment)
            throw new HttpException_1.HttpException(409, "Payment doesn't exist");
        return findPayment;
    }
    async createPayment(paymentData) {
        if ((0, util_1.isEmpty)(paymentData))
            throw new HttpException_1.HttpException(400, 'paymentData is empty');
        const order = await orders_model_1.default.findById(paymentData.order);
        if (!order) {
            throw new HttpException_1.HttpException(404, `Order ${paymentData.order} not found`);
        }
        if (order.total !== paymentData.amount) {
            throw new HttpException_1.HttpException(400, `Payment amount ${paymentData.amount} does not match order total ${order.total}`);
        }
        const createPaymentData = await this.payments.create(Object.assign(Object.assign({}, paymentData), { status: payments_interface_1.PaymentStatus.PENDING, initiatedAt: new Date() }));
        return createPaymentData;
    }
    async updatePayment(paymentId, paymentData) {
        var _a;
        if ((0, util_1.isEmpty)(paymentData))
            throw new HttpException_1.HttpException(400, 'paymentData is empty');
        const payment = await this.findPaymentById(paymentId);
        if (paymentData.status) {
            if (!(0, payments_interface_1.isPaymentStatus)(paymentData.status)) {
                throw new HttpException_1.HttpException(400, 'Invalid payment status');
            }
            const invalidTransitions = {
                [payments_interface_1.PaymentStatus.COMPLETED]: [payments_interface_1.PaymentStatus.PENDING, payments_interface_1.PaymentStatus.PROCESSING],
                [payments_interface_1.PaymentStatus.REFUNDED]: [payments_interface_1.PaymentStatus.PENDING, payments_interface_1.PaymentStatus.PROCESSING, payments_interface_1.PaymentStatus.FAILED, payments_interface_1.PaymentStatus.CANCELLED],
                [payments_interface_1.PaymentStatus.PARTIALLY_REFUNDED]: [payments_interface_1.PaymentStatus.PENDING, payments_interface_1.PaymentStatus.PROCESSING, payments_interface_1.PaymentStatus.FAILED, payments_interface_1.PaymentStatus.CANCELLED],
                [payments_interface_1.PaymentStatus.FAILED]: [payments_interface_1.PaymentStatus.COMPLETED, payments_interface_1.PaymentStatus.REFUNDED, payments_interface_1.PaymentStatus.PARTIALLY_REFUNDED],
                [payments_interface_1.PaymentStatus.CANCELLED]: [payments_interface_1.PaymentStatus.COMPLETED, payments_interface_1.PaymentStatus.REFUNDED, payments_interface_1.PaymentStatus.PARTIALLY_REFUNDED],
                [payments_interface_1.PaymentStatus.PENDING]: [payments_interface_1.PaymentStatus.COMPLETED, payments_interface_1.PaymentStatus.REFUNDED, payments_interface_1.PaymentStatus.PARTIALLY_REFUNDED],
                [payments_interface_1.PaymentStatus.PROCESSING]: [payments_interface_1.PaymentStatus.COMPLETED, payments_interface_1.PaymentStatus.REFUNDED, payments_interface_1.PaymentStatus.PARTIALLY_REFUNDED],
            };
            if ((_a = invalidTransitions[payment.status]) === null || _a === void 0 ? void 0 : _a.includes(paymentData.status)) {
                throw new HttpException_1.HttpException(400, `Invalid status transition from ${payment.status} to ${paymentData.status}`);
            }
        }
        const updateData = Object.assign({}, paymentData);
        if (paymentData.status) {
            switch (paymentData.status) {
                case payments_interface_1.PaymentStatus.PROCESSING:
                    updateData.processedAt = new Date();
                    break;
                case payments_interface_1.PaymentStatus.COMPLETED:
                    updateData.completedAt = new Date();
                    break;
                case payments_interface_1.PaymentStatus.FAILED:
                    updateData.failedAt = new Date();
                    break;
                case payments_interface_1.PaymentStatus.CANCELLED:
                    updateData.cancelledAt = new Date();
                    break;
                case payments_interface_1.PaymentStatus.REFUNDED:
                case payments_interface_1.PaymentStatus.PARTIALLY_REFUNDED:
                    break;
            }
            updateData.lastUpdatedAt = new Date();
        }
        const updatePaymentById = await this.payments
            .findByIdAndUpdate(paymentId, { $set: updateData }, { new: true })
            .populate('user')
            .populate('order');
        return updatePaymentById;
    }
    async processRefund(paymentId, refundData) {
        const payment = await this.findPaymentById(paymentId);
        if (!payment.canBeRefunded()) {
            throw new HttpException_1.HttpException(400, `Payment cannot be refunded in status ${payment.status}`);
        }
        const remainingRefundableAmount = payment.getRemainingRefundableAmount();
        if (refundData.amount <= 0) {
            throw new HttpException_1.HttpException(400, 'Refund amount must be greater than 0');
        }
        if (refundData.amount > remainingRefundableAmount) {
            throw new HttpException_1.HttpException(400, `Refund amount ${refundData.amount} exceeds remaining refundable amount ${remainingRefundableAmount}`);
        }
        const totalRefundedAmount = (payment.totalRefundedAmount || 0) + refundData.amount;
        const refund = Object.assign(Object.assign({}, refundData), { status: payments_interface_1.PaymentStatus.PROCESSING, transactionId: `REF-${Date.now()}-${(0, uuid_1.v4)()}`, refundedAt: new Date() });
        const updatePaymentById = await this.payments
            .findByIdAndUpdate(paymentId, {
            $push: { refunds: refund },
            $set: {
                status: totalRefundedAmount === payment.amount ? payments_interface_1.PaymentStatus.REFUNDED : payments_interface_1.PaymentStatus.PARTIALLY_REFUNDED,
                totalRefundedAmount,
                lastUpdatedAt: new Date(),
            },
        }, { new: true })
            .populate('user')
            .populate('order');
        return updatePaymentById;
    }
    async updateRefundStatus(paymentId, refundId, statusData) {
        const payment = await this.findPaymentById(paymentId);
        const refundIndex = payment.refunds.findIndex(r => r.transactionId === refundId);
        if (refundIndex === -1) {
            throw new HttpException_1.HttpException(404, 'Refund not found');
        }
        const updateQuery = {
            [`refunds.${refundIndex}.status`]: statusData.status,
            [`refunds.${refundIndex}.notes`]: statusData.notes,
        };
        const updatePaymentById = await this.payments
            .findByIdAndUpdate(paymentId, { $set: updateQuery }, { new: true })
            .populate('user')
            .populate('order');
        return updatePaymentById;
    }
    async deletePayment(paymentId) {
        const payment = await this.findPaymentById(paymentId);
        if (![payments_interface_1.PaymentStatus.FAILED, payments_interface_1.PaymentStatus.CANCELLED].includes(payment.status)) {
            throw new HttpException_1.HttpException(400, 'Only failed or cancelled payments can be deleted');
        }
        const deletePaymentById = await this.payments.findByIdAndDelete(paymentId);
        return deletePaymentById;
    }
    async getPayments(filters = {}) {
        const query = {};
        if (filters.userId)
            query.user = filters.userId;
        if (filters.orderId)
            query.order = filters.orderId;
        if (filters.status)
            query.status = filters.status;
        if (filters.currency)
            query.currency = filters.currency;
        if (filters.startDate || filters.endDate) {
            query.initiatedAt = {};
            if (filters.startDate)
                query.initiatedAt.$gte = filters.startDate;
            if (filters.endDate)
                query.initiatedAt.$lte = filters.endDate;
        }
        if (filters.minAmount || filters.maxAmount) {
            query.amount = {};
            if (filters.minAmount)
                query.amount.$gte = filters.minAmount;
            if (filters.maxAmount)
                query.amount.$lte = filters.maxAmount;
        }
        return this.payments
            .find(query)
            .populate('user')
            .populate('order')
            .sort({ initiatedAt: -1 });
    }
    convertPaymentMethodDtoToMethod(dto) {
        if (!dto)
            return undefined;
        if (!(0, payments_interface_1.isPaymentChannel)(dto.type)) {
            throw new HttpException_1.HttpException(400, 'Invalid payment channel');
        }
        return {
            type: dto.type,
            cardNumber: dto.cardNumber,
            expiryMonth: dto.expiryMonth,
            expiryYear: dto.expiryYear,
            cvv: dto.cvv,
            bank: dto.bank,
            accountNumber: dto.accountNumber,
        };
    }
    async initiatePayment(paymentData) {
        const transaction = {
            amount: {
                value: paymentData.amount,
                currency: paymentData.currency,
            },
            customer: {
                email: paymentData.email,
                firstName: paymentData.firstName,
                lastName: paymentData.lastName,
            },
            metadata: paymentData.metadata,
            status: payments_interface_1.PaymentStatus.PENDING,
            paymentMethod: this.convertPaymentMethodDtoToMethod(paymentData.paymentMethod),
            currency: paymentData.currency,
            reference: `PAY-${Date.now()}-${(0, uuid_1.v4)()}`,
            provider: payments_interface_1.PaymentProvider.PAYSTACK,
        };
        const paystackResponse = await this.paystackProvider.initializePayment(transaction);
        const payment = await this.payments.create({
            amount: paymentData.amount,
            currency: paymentData.currency,
            status: payments_interface_1.PaymentStatus.PENDING,
            paymentDetails: {
                method: paymentData.paymentMethod,
                provider: paymentData.provider
            },
            initiatedAt: new Date(),
            metadata: Object.assign({ paymentUrl: paystackResponse.data.authorization_url, accessCode: paystackResponse.data.access_code }, paymentData.metadata)
        });
        return payment;
    }
    async verifyPayment(reference) {
        if ((0, util_1.isEmpty)(reference))
            throw new HttpException_1.HttpException(400, 'Reference is empty');
        const transaction = await payments_model_1.PaymentTransactionModel.findOne({ reference });
        if (!transaction)
            throw new HttpException_1.HttpException(404, 'Transaction not found');
        const verificationResponse = await this.paystackProvider.verifyPayment(reference);
        const paystackStatus = this.paystackProvider.mapPaystackStatus(verificationResponse.data.status);
        if (!(0, payments_interface_1.isPaymentStatus)(paystackStatus)) {
            throw new HttpException_1.HttpException(500, 'Invalid payment status from provider');
        }
        transaction.status = paystackStatus;
        transaction.gatewayResponse = verificationResponse.data.gateway_response;
        const channel = verificationResponse.data.channel;
        if (!(0, payments_interface_1.isPaymentChannel)(channel)) {
            throw new HttpException_1.HttpException(500, 'Invalid payment channel from provider');
        }
        transaction.channel = channel;
        transaction.paidAt = verificationResponse.data.paid_at ? new Date(verificationResponse.data.paid_at) : undefined;
        transaction.providerFee = verificationResponse.data.fees / 100;
        transaction.settlementAmount = (verificationResponse.data.amount - verificationResponse.data.fees) / 100;
        transaction.ipAddress = verificationResponse.data.ip_address;
        transaction.updatedAt = new Date();
        await transaction.save();
        return transaction.toObject();
    }
    async refundPayment(paymentId, refundData) {
        const payment = await this.payments.findById(paymentId);
        if (!payment) {
            throw new HttpException_1.HttpException(404, 'Payment not found');
        }
        if (!payment.canBeRefunded()) {
            throw new HttpException_1.HttpException(400, 'Payment cannot be refunded');
        }
        const remainingRefundableAmount = payment.getRemainingRefundableAmount();
        if (refundData.amount > remainingRefundableAmount) {
            throw new HttpException_1.HttpException(400, 'Refund amount exceeds refundable amount');
        }
        const refundResponse = await this.paystackProvider.refundPayment(payment.paymentDetails.transactionId, refundData.amount);
        const refund = await this.refunds.create({
            amount: {
                value: refundData.amount,
                currency: payment.currency
            },
            reason: refundData.reason,
            status: payments_interface_1.PaymentStatus.PROCESSING,
            reference: refundResponse.data.reference
        });
        if (refundData.amount === payment.amount) {
            await payment.updateOne({
                status: payments_interface_1.PaymentStatus.REFUNDED,
                totalRefundedAmount: payment.amount,
                $push: { refunds: refund }
            });
        }
        else {
            await payment.updateOne({
                status: payments_interface_1.PaymentStatus.PARTIALLY_REFUNDED,
                totalRefundedAmount: (payment.totalRefundedAmount || 0) + refundData.amount,
                $push: { refunds: refund }
            });
        }
        return refund;
    }
    async getTransaction(transactionId) {
        if ((0, util_1.isEmpty)(transactionId))
            throw new HttpException_1.HttpException(400, 'TransactionId is empty');
        const findTransaction = await payments_model_1.PaymentTransactionModel.findById(transactionId);
        if (!findTransaction)
            throw new HttpException_1.HttpException(404, "Transaction doesn't exist");
        return findTransaction.toObject();
    }
    async getTransactions(filters = {}) {
        const transactions = await payments_model_1.PaymentTransactionModel.find(filters).sort({ createdAt: -1 });
        return transactions.map(t => t.toObject());
    }
    async getRefund(refundId) {
        if ((0, util_1.isEmpty)(refundId))
            throw new HttpException_1.HttpException(400, 'RefundId is empty');
        const findRefund = await payments_model_1.PaymentRefundModel.findById(refundId);
        if (!findRefund)
            throw new HttpException_1.HttpException(404, "Refund doesn't exist");
        return findRefund.toObject();
    }
    async getRefunds(filters = {}) {
        const refunds = await payments_model_1.PaymentRefundModel.find(filters).sort({ createdAt: -1 });
        return refunds.map(r => r.toObject());
    }
}
exports.PaymentService = PaymentService;
exports.default = PaymentService;
//# sourceMappingURL=payments.service.js.map