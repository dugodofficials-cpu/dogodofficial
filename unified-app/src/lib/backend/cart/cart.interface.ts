import { User } from '@backend/users/users.interface';
import { Product } from '@backend/products/products.interface';
export enum CartStatus {
  ACTIVE = 'ACTIVE',
  CHECKOUT_IN_PROGRESS = 'CHECKOUT_IN_PROGRESS',
  CONVERTED_TO_ORDER = 'CONVERTED_TO_ORDER',
  ABANDONED = 'ABANDONED',
  EXPIRED = 'EXPIRED',
}
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  FREE_SHIPPING = 'FREE_SHIPPING',
}
export interface CartItem {
  product: Product | string;
  quantity: number;
  price: number;
  total: number;
  selectedOptions?: Record<string, any>;
  notes?: string;
  addedAt: Date;
  updatedAt?: Date;
}
export interface AppliedDiscount {
  code: string;
  type: DiscountType;
  value: number;
  description: string;
  appliedAt: Date;
  expiresAt?: Date;
  minimumPurchase?: number;
  maximumDiscount?: number;
  metadata?: Record<string, any>;
  couponId?: string;
}
export interface ShippingEstimate {
  provider: string;
  method: string;
  cost: number;
  estimatedDays: number;
  isAvailable: boolean;
  restrictions?: string[];
}
export interface Cart {
  _id: string;
  user: User | string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discounts: AppliedDiscount[];
  total: number;
  status: CartStatus;
  shippingEstimates?: ShippingEstimate[];
  selectedShippingMethod?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  expiresAt?: Date;
  notes?: string;
  metadata?: Record<string, any>;
  isEmpty(): boolean;
  hasDigitalItems(): boolean;
  hasPhysicalItems(): boolean;
  requiresShipping(): boolean;
  isEligibleForDiscount(minimumPurchase: number): boolean;
  getTotalWeight(): number;
  getItemById(productId: string): CartItem | undefined;
}