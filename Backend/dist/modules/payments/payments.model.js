"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRefundModel = exports.PaymentTransactionModel = exports.PaymentModel = void 0;
const mongoose_1 = require("mongoose");
const payments_interface_1 = require("./payments.interface");
const paymentMethodSchema = new mongoose_1.Schema({
    type: { type: String, enum: Object.values(payments_interface_1.PaymentChannel), required: true },
    cardNumber: { type: String },
    expiryMonth: { type: String },
    expiryYear: { type: String },
    cvv: { type: String },
    bank: { type: String },
    accountNumber: { type: String },
}, { _id: false });
const paymentAmountSchema = new mongoose_1.Schema({
    value: { type: Number, required: true },
    currency: { type: String, required: true },
}, { _id: false });
const paymentCustomerSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
}, { _id: false });
const paymentMetadataSchema = new mongoose_1.Schema({
    orderId: { type: String },
    productIds: [{ type: String }],
    customFields: { type: mongoose_1.Schema.Types.Mixed },
}, { _id: false });
const paymentTransactionSchema = new mongoose_1.Schema({
    provider: { type: String, enum: Object.values(payments_interface_1.PaymentProvider), required: true },
    reference: { type: String, required: true },
    amount: {
        value: { type: Number, required: true },
        currency: { type: String, required: true },
    },
    customer: {
        email: { type: String, required: true },
        firstName: String,
        lastName: String,
        phone: String,
        metadata: mongoose_1.Schema.Types.Mixed,
    },
    metadata: mongoose_1.Schema.Types.Mixed,
    status: { type: String, enum: Object.values(payments_interface_1.PaymentStatus), required: true },
    paymentMethod: {
        type: { type: String, enum: Object.values(payments_interface_1.PaymentChannel), required: true },
        cardNumber: String,
        expiryMonth: String,
        expiryYear: String,
        cvv: String,
        bank: String,
        accountNumber: String,
    },
    providerFee: Number,
    settlementAmount: Number,
    paymentUrl: String,
    accessCode: String,
    gatewayResponse: String,
    ipAddress: String,
    currency: { type: String, required: true },
    channel: { type: String, enum: Object.values(payments_interface_1.PaymentChannel) },
    paidAt: Date,
}, {
    timestamps: true,
});
const paymentRefundSchema = new mongoose_1.Schema({
    transactionId: { type: String, required: true },
    amount: {
        value: { type: Number, required: true },
        currency: { type: String, required: true },
    },
    reason: { type: String, required: true },
    status: { type: String, enum: Object.values(payments_interface_1.PaymentStatus), required: true },
    reference: { type: String, required: true },
    metadata: mongoose_1.Schema.Types.Mixed,
}, {
    timestamps: true,
});
paymentTransactionSchema.index({ reference: 1 }, { unique: true });
paymentTransactionSchema.index({ status: 1 });
paymentTransactionSchema.index({ createdAt: -1 });
paymentTransactionSchema.index({ 'metadata.orderId': 1 });
paymentRefundSchema.index({ reference: 1 }, { unique: true });
paymentRefundSchema.index({ transactionId: 1 });
paymentRefundSchema.index({ status: 1 });
paymentRefundSchema.index({ createdAt: -1 });
const paymentSchema = new mongoose_1.Schema({
    order: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: Object.values(payments_interface_1.PaymentStatus), required: true },
    paymentDetails: {
        method: {
            type: { type: String, enum: Object.values(payments_interface_1.PaymentChannel), required: true },
            cardNumber: String,
            expiryMonth: String,
            expiryYear: String,
            cvv: String,
            bank: String,
            accountNumber: String,
        },
        provider: { type: String, enum: Object.values(payments_interface_1.PaymentProvider), required: true },
        transactionId: String,
        cardLast4: String,
        cardBrand: String,
        cardExpiryMonth: String,
        cardExpiryYear: String,
        bankName: String,
        bankAccountLast4: String,
        walletType: String,
        cryptoCurrency: String,
        cryptoAddress: String,
    },
    refunds: [{
            amount: Number,
            reason: String,
            status: { type: String, enum: Object.values(payments_interface_1.PaymentStatus) },
            transactionId: String,
            refundedAt: Date,
            processedBy: String,
            notes: String,
        }],
    totalRefundedAmount: Number,
    initiatedAt: { type: Date, required: true },
    processedAt: Date,
    completedAt: Date,
    failedAt: Date,
    cancelledAt: Date,
    lastUpdatedAt: Date,
    errorCode: String,
    errorMessage: String,
    attempts: Number,
    metadata: mongoose_1.Schema.Types.Mixed,
    notes: String,
}, {
    timestamps: true,
});
paymentSchema.methods.canBeRefunded = function () {
    return this.status === payments_interface_1.PaymentStatus.COMPLETED;
};
paymentSchema.methods.getRemainingRefundableAmount = function () {
    if (!this.canBeRefunded())
        return 0;
    return this.amount - (this.totalRefundedAmount || 0);
};
paymentSchema.methods.isFullyRefunded = function () {
    return this.status === payments_interface_1.PaymentStatus.REFUNDED;
};
paymentSchema.methods.isPartiallyRefunded = function () {
    return this.status === payments_interface_1.PaymentStatus.PARTIALLY_REFUNDED;
};
exports.PaymentModel = (0, mongoose_1.model)('Payment', paymentSchema);
exports.PaymentTransactionModel = (0, mongoose_1.model)('PaymentTransaction', paymentTransactionSchema);
exports.PaymentRefundModel = (0, mongoose_1.model)('PaymentRefund', paymentRefundSchema);
//# sourceMappingURL=payments.model.js.map