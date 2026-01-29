import { Order, OrderStatus, DeliveryStatus } from './orders.interface';
import { User } from '../users/users.interface';
declare class OrderEmailService {
    private emailService;
    private sendEmailSafely;
    sendOrderConfirmation(order: Order, user: User): Promise<void>;
    sendOrderProcessing(order: Order, user: User): Promise<void>;
    sendOrderShipped(order: Order, user: User): Promise<void>;
    sendOrderDelivered(order: Order, user: User): Promise<void>;
    sendOrderCancelled(order: Order, user: User, reason?: string): Promise<void>;
    sendOrderRefunded(order: Order, user: User, refundAmount: number): Promise<void>;
    sendDeliveryUpdate(order: Order, user: User, deliveryStatus: DeliveryStatus): Promise<void>;
    sendDigitalDelivery(order: Order, user: User): Promise<void>;
    sendOrderStatusUpdate(order: Order, user: User, previousStatus: OrderStatus, newStatus: OrderStatus): Promise<void>;
    sendLowStockAlert(order: Order, user: User, productName: string): Promise<void>;
    sendBackorderNotification(order: Order, user: User, productName: string, estimatedRestockDate?: Date): Promise<void>;
}
export default OrderEmailService;
