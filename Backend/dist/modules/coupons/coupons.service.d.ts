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
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './coupons.dto';
import { Coupon } from './coupons.interface';
declare class CouponService {
    coupons: import("mongoose").Model<Coupon, {}, {}, {}, any>;
    findAllCoupons(): Promise<Coupon[]>;
    findCouponById(couponId: string): Promise<Coupon>;
    findCouponByCode(code: string): Promise<Coupon>;
    createCoupon(couponData: CreateCouponDto): Promise<Coupon>;
    updateCoupon(couponId: string, couponData: UpdateCouponDto): Promise<Coupon>;
    deleteCoupon(couponId: string): Promise<Coupon>;
    validateCoupon(validationData: ValidateCouponDto): Promise<{
        isValid: boolean;
        discount: number;
        message?: string;
    }>;
    incrementUsageCount(couponCode: string): Promise<void>;
}
export default CouponService;
