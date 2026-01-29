import { CouponType, CouponStatus } from './coupons.interface';
export declare class CouponConditionsDto {
    applicableProducts?: string[];
    applicableCategories?: string[];
    excludedProducts?: string[];
    excludedCategories?: string[];
    firstPurchaseOnly?: boolean;
}
export declare class CreateCouponDto {
    code: string;
    type: CouponType;
    value: number;
    description: string;
    minimumPurchase?: number;
    maximumDiscount?: number;
    usageLimit?: number;
    startDate: Date;
    endDate: Date;
    conditions?: CouponConditionsDto;
}
export declare class UpdateCouponDto extends CreateCouponDto {
    code: string;
    type: CouponType;
    value: number;
    description: string;
    status?: CouponStatus;
}
export declare class ValidateCouponDto {
    code: string;
    cartTotal: number;
    productIds?: string[];
    categoryIds?: string[];
    isFirstPurchase?: boolean;
}
