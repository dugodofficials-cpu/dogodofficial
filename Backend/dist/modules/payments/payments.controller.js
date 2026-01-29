"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const payments_service_1 = tslib_1.__importDefault(require("../../modules/payments/payments.service"));
const paystack_webhook_1 = require("./integrations/paystack.webhook");
class PaymentController {
    constructor() {
        this.paymentService = new payments_service_1.default();
        this.getPayments = async (req, res, next) => {
            try {
                const findAllPaymentsData = await this.paymentService.findAllPayments();
                res.status(200).json({ data: findAllPaymentsData, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPaymentById = async (req, res, next) => {
            try {
                const paymentId = req.params.id;
                const findOnePaymentData = await this.paymentService.findPaymentById(paymentId);
                res.status(200).json({ data: findOnePaymentData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPaymentByTransactionId = async (req, res, next) => {
            try {
                const transactionId = req.params.transactionId;
                const findOnePaymentData = await this.paymentService.findPaymentByTransactionId(transactionId);
                res.status(200).json({ data: findOnePaymentData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createPayment = async (req, res, next) => {
            try {
                const paymentData = req.body;
                const createPaymentData = await this.paymentService.createPayment(paymentData);
                res.status(201).json({ data: createPaymentData, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePayment = async (req, res, next) => {
            try {
                const paymentId = req.params.id;
                const paymentData = req.body;
                const updatePaymentData = await this.paymentService.updatePayment(paymentId, paymentData);
                res.status(200).json({ data: updatePaymentData, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.processRefund = async (req, res, next) => {
            try {
                const paymentId = req.params.id;
                const refundData = req.body;
                const updatePaymentData = await this.paymentService.processRefund(paymentId, refundData);
                res.status(200).json({ data: updatePaymentData, message: 'refund processed' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateRefundStatus = async (req, res, next) => {
            try {
                const paymentId = req.params.id;
                const refundId = req.params.refundId;
                const statusData = req.body;
                const updatePaymentData = await this.paymentService.updateRefundStatus(paymentId, refundId, statusData);
                res.status(200).json({ data: updatePaymentData, message: 'refund status updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deletePayment = async (req, res, next) => {
            try {
                const paymentId = req.params.id;
                const deletePaymentData = await this.paymentService.deletePayment(paymentId);
                res.status(200).json({ data: deletePaymentData, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserPayments = async (req, res, next) => {
            try {
                const userId = req.params.userId;
                const payments = await this.paymentService.getPayments({ userId });
                res.status(200).json({ data: payments, message: 'findUserPayments' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPaymentsByStatus = async (req, res, next) => {
            try {
                const status = req.params.status;
                const payments = await this.paymentService.getPayments({ status });
                res.status(200).json({ data: payments, message: 'findPaymentsByStatus' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPaymentsByDateRange = async (req, res, next) => {
            try {
                const startDate = new Date(req.query.startDate);
                const endDate = new Date(req.query.endDate);
                const payments = await this.paymentService.getPayments({ startDate, endDate });
                res.status(200).json({ data: payments, message: 'findPaymentsByDateRange' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getOrderPayments = async (req, res, next) => {
            try {
                const orderId = req.params.orderId;
                const payments = await this.paymentService.getPayments({ orderId });
                res.status(200).json({ data: payments, message: 'findOrderPayments' });
            }
            catch (error) {
                next(error);
            }
        };
        this.initiatePayment = async (req, res, next) => {
            try {
                const paymentData = req.body;
                const payment = await this.paymentService.initiatePayment(paymentData);
                res.status(201).json({ data: payment, message: 'Payment initiated successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyPayment = async (req, res, next) => {
            try {
                const reference = String(req.params.reference);
                const payment = await this.paymentService.verifyPayment(reference);
                res.status(200).json({ data: payment, message: 'Payment verified successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.refundPayment = async (req, res, next) => {
            try {
                const transactionId = String(req.params.transactionId);
                const refundData = req.body;
                const refund = await this.paymentService.refundPayment(transactionId, refundData);
                res.status(200).json({ data: refund, message: 'Refund initiated successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getTransaction = async (req, res, next) => {
            try {
                const transactionId = String(req.params.transactionId);
                const transaction = await this.paymentService.getTransaction(transactionId);
                res.status(200).json({ data: transaction, message: 'Transaction retrieved successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getTransactions = async (req, res, next) => {
            try {
                const filters = req.query;
                const transactions = await this.paymentService.getTransactions(filters);
                res.status(200).json({ data: transactions, message: 'Transactions retrieved successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getRefund = async (req, res, next) => {
            try {
                const refundId = String(req.params.refundId);
                const refund = await this.paymentService.getRefund(refundId);
                res.status(200).json({ data: refund, message: 'Refund retrieved successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getRefunds = async (req, res, next) => {
            try {
                const filters = req.query;
                const refunds = await this.paymentService.getRefunds(filters);
                res.status(200).json({ data: refunds, message: 'Refunds retrieved successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.handlePaystackWebhook = async (req, res, next) => {
            await paystack_webhook_1.paystackWebhookHandler.handleWebhook(req, res, next);
        };
    }
}
exports.default = PaymentController;
//# sourceMappingURL=payments.controller.js.map