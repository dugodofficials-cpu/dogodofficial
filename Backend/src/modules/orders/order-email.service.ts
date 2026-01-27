import { Order, OrderStatus, DeliveryStatus } from './orders.interface';
import { User } from '../users/users.interface';
import { formatMoney } from '../../utils/money';
const EmailService = require('../email/email.service').default;
class OrderEmailService {
  private emailService = new EmailService();
  private async sendEmailSafely(templateData: any, emailType: string): Promise<void> {
    try {
      await this.emailService.sendTemplateEmail(templateData);
      console.log(`${emailType} email sent successfully`);
    } catch (error) {
      console.error(`Failed to send ${emailType} email:`, error);
    }
  }
  async sendOrderConfirmation(order: Order, user: User): Promise<void> {
    const templateData = {
      templateName: 'order-confirmation',
      to: [user.email],
      variables: {
        customerName: `${user.firstName} ${user.lastName}`,
        orderNumber: order.orderNumber,
        orderDate: order.orderedAt.toLocaleDateString(),
        total: formatMoney(order.total),
        items: order.items.map(item => ({
          name: typeof item.product === 'string' ? 'Product' : item.product.name,
          quantity: item.quantity,
          price: formatMoney(item.price),
          total: formatMoney(item.total)
        })),
        subtotal: formatMoney(order.subtotal),
        tax: formatMoney(order.tax),
        shipping: formatMoney(order.shippingCost),
        discount: formatMoney(order.discount),
        finalTotal: formatMoney(order.total),
        estimatedDelivery: order.shippingDetails?.estimatedDeliveryDate
          ? order.shippingDetails.estimatedDeliveryDate.toLocaleDateString()
          : 'TBD'
      }
    };
    await this.sendEmailSafely(templateData, 'order confirmation');
  }
  async sendOrderProcessing(order: Order, user: User): Promise<void> {
    const templateData = {
      templateName: 'order-processing',
      to: [user.email],
      variables: {
        customerName: `${user.firstName} ${user.lastName}`,
        orderNumber: order.orderNumber,
        orderDate: order.orderedAt.toLocaleDateString(),
        processingDate: new Date().toLocaleDateString(),
        estimatedDelivery: order.shippingDetails?.estimatedDeliveryDate
          ? order.shippingDetails.estimatedDeliveryDate.toLocaleDateString()
          : 'TBD'
      }
    };
    await this.emailService.sendTemplateEmail(templateData);
  }
  async sendOrderShipped(order: Order, user: User): Promise<void> {
    const templateData = {
      templateName: 'order-shipped',
      to: [user.email],
      variables: {
        customerName: `${user.firstName} ${user.lastName}`,
        orderNumber: order.orderNumber,
        shippingDate: new Date().toLocaleDateString(),
        trackingNumber: order.shippingDetails?.trackingNumber || 'N/A',
        carrier: order.shippingDetails?.carrier || 'N/A',
        estimatedDelivery: order.shippingDetails?.estimatedDeliveryDate
          ? order.shippingDetails.estimatedDeliveryDate.toLocaleDateString()
          : 'TBD',
        shippingAddress: order.shippingDetails ?
          `${order.shippingDetails.address.street}, ${order.shippingDetails.address.city}, ${order.shippingDetails.address.state} ${order.shippingDetails.address.postalCode}` :
          'N/A'
      }
    };
    await this.emailService.sendTemplateEmail(templateData);
  }
  async sendOrderDelivered(order: Order, user: User): Promise<void> {
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
  async sendOrderCancelled(order: Order, user: User, reason?: string): Promise<void> {
    const templateData = {
      templateName: 'order-cancelled',
      to: [user.email],
      variables: {
        customerName: `${user.firstName} ${user.lastName}`,
        orderNumber: order.orderNumber,
        orderDate: order.orderedAt.toLocaleDateString(),
        cancellationDate: new Date().toLocaleDateString(),
        reason: reason || 'No reason provided',
        refundAmount: formatMoney(order.total),
        refundTimeframe: '5-7 business days'
      }
    };
    await this.emailService.sendTemplateEmail(templateData);
  }
  async sendOrderRefunded(order: Order, user: User, refundAmount: number): Promise<void> {
    const templateData = {
      templateName: 'order-refunded',
      to: [user.email],
      variables: {
        customerName: `${user.firstName} ${user.lastName}`,
        orderNumber: order.orderNumber,
        refundDate: new Date().toLocaleDateString(),
        refundAmount: formatMoney(refundAmount),
        refundTimeframe: '5-7 business days'
      }
    };
    await this.emailService.sendTemplateEmail(templateData);
  }
  async sendDeliveryUpdate(order: Order, user: User, deliveryStatus: DeliveryStatus): Promise<void> {
    const statusMessages = {
      [DeliveryStatus.PROCESSING]: 'Your order is being processed for shipping',
      [DeliveryStatus.IN_TRANSIT]: 'Your order is in transit',
      [DeliveryStatus.OUT_FOR_DELIVERY]: 'Your order is out for delivery',
      [DeliveryStatus.DELIVERED]: 'Your order has been delivered',
      [DeliveryStatus.FAILED]: 'Delivery attempt failed',
      [DeliveryStatus.RETURNED]: 'Your order has been returned'
    };
    const templateData = {
      templateName: 'delivery-update',
      to: [user.email],
      variables: {
        customerName: `${user.firstName} ${user.lastName}`,
        orderNumber: order.orderNumber,
        deliveryStatus: deliveryStatus.replace('_', ' '),
        statusMessage: statusMessages[deliveryStatus],
        trackingNumber: order.shippingDetails?.trackingNumber || 'N/A',
        carrier: order.shippingDetails?.carrier || 'N/A',
        estimatedDelivery: order.shippingDetails?.estimatedDeliveryDate
          ? order.shippingDetails.estimatedDeliveryDate.toLocaleDateString()
          : 'TBD'
      }
    };
    await this.emailService.sendTemplateEmail(templateData);
  }
  async sendDigitalDelivery(order: Order, user: User): Promise<void> {
    if (!order.digitalDeliveryDetails) return;
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
  async sendOrderStatusUpdate(order: Order, user: User, previousStatus: OrderStatus, newStatus: OrderStatus): Promise<void> {
    const statusMessages = {
      [OrderStatus.PENDING]: 'Your order is pending confirmation',
      [OrderStatus.CONFIRMED]: 'Your order has been confirmed',
      [OrderStatus.PROCESSING]: 'Your order is being processed',
      [OrderStatus.SHIPPED]: 'Your order has been shipped',
      [OrderStatus.DELIVERED]: 'Your order has been delivered',
      [OrderStatus.CANCELLED]: 'Your order has been cancelled',
      [OrderStatus.REFUNDED]: 'Your order has been refunded'
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
  async sendLowStockAlert(order: Order, user: User, productName: string): Promise<void> {
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
  async sendBackorderNotification(order: Order, user: User, productName: string, estimatedRestockDate?: Date): Promise<void> {
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
export default OrderEmailService;