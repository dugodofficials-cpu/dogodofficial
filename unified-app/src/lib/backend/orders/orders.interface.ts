import { User } from '@backend/users/users.interface';
import { Product } from '@backend/products/products.interface';
import { PaymentStatus } from '../payments/payments.interface';
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  DELETED = 'DELETED',
}
export enum DeliveryStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
}
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
export enum Carriers {
  DHL = 'DHL',
  SPEEDAF = 'SPEEDAF',
  GIG = 'GIG',
  CUSTOM = 'CUSTOM',
}
export interface ShippingDetails {
  address: Address;
  trackingNumber?: string;
  carrier?: Carriers;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  deliveryStatus: DeliveryStatus;
  deliveryNotes?: string;
}
export interface DigitalDeliveryDetails {
  email: string;
  downloadLinks: string[];
  accessKeys: string[];
  expiryDate?: Date;
  downloadCount: number;
}
export interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
  total: number;
  selectedOptions?: string[];
  isBundle?: boolean;
}
export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  totalProductsSold: number;
  totalCustomers: number;
  totalRefunds: number;
  totalPendingOrders: number;
}
export interface Order {
  _id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  cartId: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingDetails: ShippingDetails;
  digitalDeliveryDetails?: DigitalDeliveryDetails;
  orderedAt: Date;
  processedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  notes?: string;
  isGift?: boolean;
  giftMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}