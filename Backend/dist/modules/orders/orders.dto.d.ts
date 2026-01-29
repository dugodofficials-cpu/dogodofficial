import { PaymentStatus } from '../payments/payments.interface';
import { Carriers, DeliveryStatus, OrderStatus } from './orders.interface';
export declare class AddressDto {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export declare class ShippingDetailsDto {
    address: AddressDto;
    trackingNumber?: string;
    carrier?: Carriers;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    deliveryStatus: DeliveryStatus;
    deliveryNotes?: string;
}
export declare class DigitalDeliveryDetailsDto {
    email: string;
    downloadLinks: string[];
    accessKeys: string[];
    expiryDate?: Date;
    downloadCount: number;
}
export declare class OrderItemDto {
    product: string;
    quantity: number;
    price: number;
    total: number;
    selectedOptions?: string[];
}
export declare class CreateOrderDto {
    user: string;
    items: OrderItemDto[];
    subtotal: number;
    tax: number;
    shippingCost: number;
    discount: number;
    total: number;
    status?: OrderStatus;
    paymentStatus: string;
    shippingDetails: ShippingDetailsDto;
    digitalDeliveryDetails?: DigitalDeliveryDetailsDto;
    notes?: string;
    isGift?: boolean;
    giftMessage?: string;
    couponId?: string;
}
export declare class UpdateOrderDto extends CreateOrderDto {
    user: string;
    items: OrderItemDto[];
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
    paymentStatus: PaymentStatus;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    notes?: string;
    paymentStatus: PaymentStatus;
}
export declare class UpdateDeliveryStatusDto {
    deliveryStatus: DeliveryStatus;
    trackingNumber?: string;
    carrier?: Carriers;
    estimatedDeliveryDate?: Date;
    deliveryNotes?: string;
}
export declare class GetOrdersQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    minTotal?: number;
    includeBundleItems?: boolean;
    maxTotal?: number;
    sortBy?: 'orderNumber' | 'total' | 'orderedAt' | 'status';
    sortOrder?: 'asc' | 'desc';
}
