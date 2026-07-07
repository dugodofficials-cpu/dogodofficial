import { Document } from 'mongoose';
export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}
export enum CouponStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}
export interface Coupon extends Document {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  description: string;
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: Date;
  endDate: Date;
  status: CouponStatus;
  conditions?: {
    applicableProducts?: string[];
    applicableCategories?: string[];
    excludedProducts?: string[];
    excludedCategories?: string[];
    firstPurchaseOnly?: boolean;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}