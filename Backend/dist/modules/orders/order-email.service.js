"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orders_interface_1 = require("./orders.interface");
const money_1 = require("../../utils/money");
const EmailService = require('../email/email.service').default;
class OrderEmailService {
    constructor() {
        this.emailService = new EmailService();
    }
    async sendEmailSafely(templateData, emailType) {
        try {
            await this.emailService.sendTemplateEmail(templateData);
            console.log(`${emailType} email sent successfully`);
        }
        catch (error) {
            console.error(`Failed to send ${emailType} email:`, error);
        }
    }
    async sendOrderConfirmation(order, user) {
        var _a;
        const templateData = {
            templateName: 'order-confirmation',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                orderDate: order.orderedAt.toLocaleDateString(),
                total: (0, money_1.formatMoney)(order.total),
                items: order.items.map(item => ({
                    name: typeof item.product === 'string' ? 'Product' : item.product.name,
                    quantity: item.quantity,
                    price: (0, money_1.formatMoney)(item.price),
                    total: (0, money_1.formatMoney)(item.total)
                })),
                subtotal: (0, money_1.formatMoney)(order.subtotal),
                tax: (0, money_1.formatMoney)(order.tax),
                shipping: (0, money_1.formatMoney)(order.shippingCost),
                discount: (0, money_1.formatMoney)(order.discount),
                finalTotal: (0, money_1.formatMoney)(order.total),
                estimatedDelivery: ((_a = order.shippingDetails) === null || _a === void 0 ? void 0 : _a.estimatedDeliveryDate)
                    ? order.shippingDetails.estimatedDeliveryDate.toLocaleDateString()
                    : 'TBD'
            }
        };
        await this.sendEmailSafely(templateData, 'order confirmation');
    }
    async sendOrderProcessing(order, user) {
        var _a;
        const templateData = {
            templateName: 'order-processing',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                orderDate: order.orderedAt.toLocaleDateString(),
                processingDate: new Date().toLocaleDateString(),
                estimatedDelivery: ((_a = order.shippingDetails) === null || _a === void 0 ? void 0 : _a.estimatedDeliveryDate)
                    ? order.shippingDetails.estimatedDeliveryDate.toLocaleDateString()
                    : 'TBD'
            }
        };
        await this.emailService.sendTemplateEmail(templateData);
    }
    async sendOrderShipped(order, user) {
        var _a, _b, _c;
        const templateData = {
            templateName: 'order-shipped',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                shippingDate: new Date().toLocaleDateString(),
                trackingNumber: ((_a = order.shippingDetails) === null || _a === void 0 ? void 0 : _a.trackingNumber) || 'N/A',
                carrier: ((_b = order.shippingDetails) === null || _b === void 0 ? void 0 : _b.carrier) || 'N/A',
                estimatedDelivery: ((_c = order.shippingDetails) === null || _c === void 0 ? void 0 : _c.estimatedDeliveryDate)
                    ? order.shippingDetails.estimatedDeliveryDate.toLocaleDateString()
                    : 'TBD',
                shippingAddress: order.shippingDetails ?
                    `${order.shippingDetails.address.street}, ${order.shippingDetails.address.city}, ${order.shippingDetails.address.state} ${order.shippingDetails.address.postalCode}` :
                    'N/A'
            }
        };
        await this.emailService.sendTemplateEmail(templateData);
    }
    async sendOrderDelivered(order, user) {
        const templateData = {
            templateName: 'order-delivered',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                deliveryDate: new Date().toLocaleDateString(),
                deliveryAddress: order.shippingDetails ?
                    `${order.shippingDetails.address.street}, ${order.shippingDetails.address.city}, ${order.shippingDetails.address.state} ${order.shippingDetails.address.postalCode}` :
                    'N/A'
            }
        };
        await this.emailService.sendTemplateEmail(templateData);
    }
    async sendOrderCancelled(order, user, reason) {
        const templateData = {
            templateName: 'order-cancelled',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                orderDate: order.orderedAt.toLocaleDateString(),
                cancellationDate: new Date().toLocaleDateString(),
                reason: reason || 'No reason provided',
                refundAmount: (0, money_1.formatMoney)(order.total),
                refundTimeframe: '5-7 business days'
            }
        };
        await this.emailService.sendTemplateEmail(templateData);
    }
    async sendOrderRefunded(order, user, refundAmount) {
        const templateData = {
            templateName: 'order-refunded',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                refundDate: new Date().toLocaleDateString(),
                refundAmount: (0, money_1.formatMoney)(refundAmount),
                refundTimeframe: '5-7 business days'
            }
        };
        await this.emailService.sendTemplateEmail(templateData);
    }
    async sendDeliveryUpdate(order, user, deliveryStatus) {
        var _a, _b, _c;
        const statusMessages = {
            [orders_interface_1.DeliveryStatus.PROCESSING]: 'Your order is being processed for shipping',
            [orders_interface_1.DeliveryStatus.IN_TRANSIT]: 'Your order is in transit',
            [orders_interface_1.DeliveryStatus.OUT_FOR_DELIVERY]: 'Your order is out for delivery',
            [orders_interface_1.DeliveryStatus.DELIVERED]: 'Your order has been delivered',
            [orders_interface_1.DeliveryStatus.FAILED]: 'Delivery attempt failed',
            [orders_interface_1.DeliveryStatus.RETURNED]: 'Your order has been returned'
        };
        const templateData = {
            templateName: 'delivery-update',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                deliveryStatus: deliveryStatus.replace('_', ' '),
                statusMessage: statusMessages[deliveryStatus],
                trackingNumber: ((_a = order.shippingDetails) === null || _a === void 0 ? void 0 : _a.trackingNumber) || 'N/A',
                carrier: ((_b = order.shippingDetails) === null || _b === void 0 ? void 0 : _b.carrier) || 'N/A',
                estimatedDelivery: ((_c = order.shippingDetails) === null || _c === void 0 ? void 0 : _c.estimatedDeliveryDate)
                    ? order.shippingDetails.estimatedDeliveryDate.toLocaleDateString()
                    : 'TBD'
            }
        };
        await this.emailService.sendTemplateEmail(templateData);
    }
    async sendDigitalDelivery(order, user) {
        if (!order.digitalDeliveryDetails)
            return;
        const templateData = {
            templateName: 'digital-delivery',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                downloadLinks: order.digitalDeliveryDetails.downloadLinks.join(', '),
                accessKeys: order.digitalDeliveryDetails.accessKeys.join(', '),
                expiryDate: order.digitalDeliveryDetails.expiryDate
                    ? order.digitalDeliveryDetails.expiryDate.toLocaleDateString()
                    : 'No expiry',
                downloadCount: order.digitalDeliveryDetails.downloadCount
            }
        };
        await this.emailService.sendTemplateEmail(templateData);
    }
    async sendOrderStatusUpdate(order, user, previousStatus, newStatus) {
        const statusMessages = {
            [orders_interface_1.OrderStatus.PENDING]: 'Your order is pending confirmation',
            [orders_interface_1.OrderStatus.CONFIRMED]: 'Your order has been confirmed',
            [orders_interface_1.OrderStatus.PROCESSING]: 'Your order is being processed',
            [orders_interface_1.OrderStatus.SHIPPED]: 'Your order has been shipped',
            [orders_interface_1.OrderStatus.DELIVERED]: 'Your order has been delivered',
            [orders_interface_1.OrderStatus.CANCELLED]: 'Your order has been cancelled',
            [orders_interface_1.OrderStatus.REFUNDED]: 'Your order has been refunded'
        };
        const templateData = {
            templateName: 'order-status-update',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                previousStatus: previousStatus.replace('_', ' '),
                newStatus: newStatus.replace('_', ' '),
                statusMessage: statusMessages[newStatus],
                updateDate: new Date().toLocaleDateString()
            }
        };
        await this.sendEmailSafely(templateData, 'order status update');
    }
    async sendLowStockAlert(order, user, productName) {
        const templateData = {
            templateName: 'low-stock-alert',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                productName,
                orderDate: order.orderedAt.toLocaleDateString()
            }
        };
        await this.emailService.sendTemplateEmail(templateData);
    }
    async sendBackorderNotification(order, user, productName, estimatedRestockDate) {
        const templateData = {
            templateName: 'backorder-notification',
            to: [user.email],
            variables: {
                customerName: `${user.firstName} ${user.lastName}`,
                orderNumber: order.orderNumber,
                productName,
                estimatedRestockDate: estimatedRestockDate
                    ? estimatedRestockDate.toLocaleDateString()
                    : 'TBD',
                orderDate: order.orderedAt.toLocaleDateString()
            }
        };
        await this.emailService.sendTemplateEmail(templateData);
    }
}
exports.default = OrderEmailService;
//# sourceMappingURL=order-email.service.js.map