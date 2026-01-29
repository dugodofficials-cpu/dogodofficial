"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackWebhookHandler = exports.PaystackWebhookHandler = void 0;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const HttpException_1 = require("../../../exceptions/HttpException");
const payments_service_1 = require("../payments.service");
const orders_service_1 = tslib_1.__importDefault(require("../../../modules/orders/orders.service"));
const orders_interface_1 = require("../../../modules/orders/orders.interface");
const payments_interface_1 = require("../../../modules/payments/payments.interface");
const payments_model_1 = require("../../../modules/payments/payments.model");
const cart_service_1 = tslib_1.__importDefault(require("../../../modules/cart/cart.service"));
const cart_interface_1 = require("../../../modules/cart/cart.interface");
const logger_1 = require("../../../utils/logger");
const users_service_1 = tslib_1.__importDefault(require("../../../modules/users/users.service"));
class PaystackWebhookHandler {
    constructor() {
        this.webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
        if (!this.webhookSecret) {
            throw new Error('PAYSTACK_WEBHOOK_SECRET environment variable is required');
        }
        this.paymentService = new payments_service_1.PaymentService();
        this.orderService = new orders_service_1.default();
        this.cartService = new cart_service_1.default();
        this.userService = new users_service_1.default();
    }
    verifySignature(payload, signature) {
        const hash = crypto_1.default
            .createHmac('sha512', this.webhookSecret)
            .update(payload)
            .digest('hex');
        return hash === signature;
    }
    async handleWebhook(req, res, next) {
        try {
            const signature = req.headers['x-paystack-signature'];
            if (!signature) {
                throw new HttpException_1.HttpException(400, 'Missing Paystack signature');
            }
            const payload = JSON.stringify(req.body);
            if (!this.verifySignature(payload, signature)) {
                throw new HttpException_1.HttpException(401, 'Invalid signature');
            }
            const event = req.body;
            logger_1.logger.info(`Processing Paystack webhook event: ${event.event}`, {
                event: event.event,
                reference: event.data.reference,
            });
            switch (event.event) {
                case 'charge.success':
                    await this.handleSuccessfulCharge(event.data);
                    break;
                case 'transfer.success':
                    break;
                case 'transfer.failed':
                    break;
                default:
                    logger_1.logger.info(`Unhandled Paystack webhook event: ${event.event}`);
            }
            res.status(200).json({ status: 'success' });
        }
        catch (error) {
            next(error);
        }
    }
    async handleSupportedMovement(data) {
        try {
            const transaction = await payments_model_1.PaymentTransactionModel.findOneAndUpdate({ reference: data.reference }, {
                provider: payments_interface_1.PaymentProvider.PAYSTACK,
                reference: data.reference,
                amount: {
                    value: data.amount / 100,
                    currency: data.currency,
                },
                customer: {
                    email: data.customer.email,
                    firstName: data.customer.first_name,
                    lastName: data.customer.last_name,
                    metadata: data.customer.metadata,
                },
                metadata: Object.assign({ orderId: 'supported_movement' }, data.metadata),
                status: payments_interface_1.PaymentStatus.COMPLETED,
                paymentMethod: {
                    type: data.channel.toLowerCase(),
                },
                providerFee: data.fees / 100,
                settlementAmount: (data.amount - data.fees) / 100,
                gatewayResponse: data.gateway_response,
                ipAddress: data.ip_address,
                currency: data.currency,
                channel: data.channel.toLowerCase(),
                paidAt: new Date(data.paid_at),
            }, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            });
            return;
        }
        catch (error) {
            logger_1.logger.error('Error handling supported movement', {
                error,
                reference: data.reference,
            });
            return;
        }
    }
    async handleSuccessfulCharge(data) {
        var _a, _b, _c, _d, _e;
        try {
            logger_1.logger.info(`Handling successful charge: ${JSON.stringify(data)}`);
            const orderId = (_b = (_a = data.metadata) === null || _a === void 0 ? void 0 : _a.custom_fields.find(field => field.variable_name === 'order_id')) === null || _b === void 0 ? void 0 : _b.value;
            const supportMovement = (_d = (_c = data.metadata) === null || _c === void 0 ? void 0 : _c.custom_fields.find(field => field.variable_name === 'support_type')) === null || _d === void 0 ? void 0 : _d.value;
            if (supportMovement) {
                await this.handleSupportedMovement(data);
                return;
            }
            if (!orderId) {
                logger_1.logger.warn('No order ID found in payment metadata');
                return;
            }
            const order = await this.orderService.findOrderById(orderId);
            if (!order) {
                throw new HttpException_1.HttpException(404, `Order ${orderId} not found`);
            }
            const transaction = await payments_model_1.PaymentTransactionModel.findOneAndUpdate({ reference: data.reference }, {
                provider: payments_interface_1.PaymentProvider.PAYSTACK,
                reference: data.reference,
                amount: {
                    value: data.amount / 100,
                    currency: data.currency,
                },
                customer: {
                    email: data.customer.email,
                    firstName: data.customer.first_name,
                    lastName: data.customer.last_name,
                    metadata: data.customer.metadata,
                },
                metadata: Object.assign({ orderId }, data.metadata),
                status: payments_interface_1.PaymentStatus.COMPLETED,
                paymentMethod: {
                    type: data.channel.toLowerCase(),
                },
                providerFee: data.fees / 100,
                settlementAmount: (data.amount - data.fees) / 100,
                gatewayResponse: data.gateway_response,
                ipAddress: data.ip_address,
                currency: data.currency,
                channel: data.channel.toLowerCase(),
                paidAt: new Date(data.paid_at),
            }, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            });
            const paymentDetails = {
                method: {
                    type: data.channel.toLowerCase(),
                },
                provider: payments_interface_1.PaymentProvider.PAYSTACK,
                transactionId: (_e = data.id) === null || _e === void 0 ? void 0 : _e.toString(),
            };
            if (data.authorization) {
                paymentDetails.cardLast4 = data.authorization.last4;
                paymentDetails.cardBrand = data.authorization.brand;
                paymentDetails.cardExpiryMonth = data.authorization.exp_month;
                paymentDetails.cardExpiryYear = data.authorization.exp_year;
                paymentDetails.bankName = data.authorization.bank;
            }
            const payment = await payments_model_1.PaymentModel.findOneAndUpdate({ 'metadata.reference': data.reference }, {
                order: orderId,
                user: order.user,
                amount: data.amount / 100,
                currency: data.currency,
                status: payments_interface_1.PaymentStatus.COMPLETED,
                paymentDetails,
                metadata: Object.assign({ reference: data.reference, gatewayResponse: data.gateway_response, ipAddress: data.ip_address }, data.metadata),
                processedAt: new Date(data.paid_at),
                completedAt: new Date(),
                notes: `Payment completed via Paystack. Reference: ${data.reference}`,
            }, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            });
            const user = await this.userService.findUserById(order.user._id.toString());
            if (!user) {
                throw new HttpException_1.HttpException(404, `User ${order.user._id.toString()} not found`);
            }
            await this.orderService.updateOrderStatus(orderId, {
                status: orders_interface_1.OrderStatus.CONFIRMED,
                paymentStatus: payments_interface_1.PaymentStatus.COMPLETED,
                notes: `Payment confirmed. Reference: ${data.reference}`,
            }, user);
            const userActiveCart = await this.cartService.findUserActiveCart(order.user._id.toString());
            if (userActiveCart) {
                await this.cartService.updateCart(userActiveCart._id.toString(), {
                    status: cart_interface_1.CartStatus.CONVERTED_TO_ORDER,
                    notes: `Cart converted to order ${order.orderNumber}. Payment reference: ${data.reference}`,
                });
            }
            logger_1.logger.info('Successfully processed payment and updated order', {
                reference: data.reference,
                orderId,
                paymentId: payment._id,
                transactionId: transaction._id,
                cartId: userActiveCart === null || userActiveCart === void 0 ? void 0 : userActiveCart._id,
            });
        }
        catch (error) {
            logger_1.logger.error('Error processing successful charge webhook', {
                error,
                reference: data.reference,
            });
            throw error;
        }
    }
}
exports.PaystackWebhookHandler = PaystackWebhookHandler;
exports.paystackWebhookHandler = new PaystackWebhookHandler();
//# sourceMappingURL=paystack.webhook.js.map