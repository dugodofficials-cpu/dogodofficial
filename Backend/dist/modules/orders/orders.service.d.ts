/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { CreateOrderDto, UpdateDeliveryStatusDto, UpdateOrderDto, UpdateOrderStatusDto, GetOrdersQueryDto } from '../../modules/orders/orders.dto';
import { Order, OrderStatus } from '../../modules/orders/orders.interface';
import cartService from '../cart/cart.service';
import couponService from '../coupons/coupons.service';
import { User } from '../../modules/users/users.interface';
import ShippingService from '../shipping/shipping.service';
declare class OrderService {
    orders: import("mongoose").Model<Order & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    products: import("mongoose").Model<import("../../modules/products/products.interface").Product & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    cartService: cartService;
    shippingService: ShippingService;
    couponService: couponService;
    private orderEmailService;
    findAllOrders(query?: GetOrdersQueryDto): Promise<{
        orders: Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOrderById(orderId: string, includeDeleted?: boolean): Promise<Order>;
    findOrderByNumber(orderNumber: string, includeDeleted?: boolean): Promise<Order>;
    resendOrderConfirmation(orderId: string): Promise<void>;
    orderStatistics(): Promise<{
        totalOrders: number;
        totalRevenue: number;
        totalProductsSold: number;
        totalCustomers: number;
        totalRefunds: number;
        totalPendingOrders: number;
    }>;
    createOrder(orderData: CreateOrderDto): Promise<Order>;
    updateOrder(orderId: string, orderData: UpdateOrderDto): Promise<Order>;
    updateOrderStatus(orderId: string, statusData: UpdateOrderStatusDto, user: User): Promise<Order>;
    updateDeliveryStatus(orderId: string, deliveryData: UpdateDeliveryStatusDto): Promise<Order>;
    deleteOrder(orderId: string): Promise<Order>;
    convertBundlesToProducts(orderId: string): Promise<Order>;
    processRefund(orderId: string, refundAmount: number, reason?: string): Promise<Order>;
    private restoreStock;
    private validateStatusTransition;
    private sendOrderStatusEmails;
    private checkStockAndNotify;
    getUserOrders(userId: string, page?: number, limit?: number, productType?: 'PHYSICAL' | 'DIGITAL', includeBundleItems?: boolean): Promise<{
        orders: Order[];
        total: number;
        totalPages: number;
    }>;
    getOrdersByStatus(status: OrderStatus): Promise<Order[]>;
    getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;
}
export default OrderService;
