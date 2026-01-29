import { CartStatus, DiscountType } from './cart.interface';
export declare class CartItemDto {
    product: string;
    quantity: number;
    selectedOptions?: Record<string, any>;
    notes?: string;
}
export declare class AppliedDiscountDto {
    code: string;
    type: DiscountType;
    value: number;
    description: string;
    expiresAt?: Date;
    minimumPurchase?: number;
    maximumDiscount?: number;
    metadata?: Record<string, any>;
}
export declare class ShippingEstimateDto {
    provider: string;
    method: string;
    cost: number;
    estimatedDays: number;
    isAvailable: boolean;
    restrictions?: string[];
}
export declare class CreateCartDto {
    user: string;
    items?: CartItemDto[];
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt?: Date;
    notes?: string;
    metadata?: Record<string, any>;
}
export declare class UpdateCartDto {
    status?: CartStatus;
    selectedShippingMethod?: string;
    shippingEstimates?: ShippingEstimateDto[];
    notes?: string;
    metadata?: Record<string, any>;
}
export declare class AddItemDto {
    item: CartItemDto;
}
export declare class UpdateItemDto {
    quantity: number;
    selectedOptions?: Record<string, any>;
    notes?: string;
}
export declare class ApplyDiscountDto {
    code: string;
}
export declare class UpdateShippingMethodDto {
    method: string;
}
