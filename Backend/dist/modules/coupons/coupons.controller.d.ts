import { NextFunction, Request, Response } from 'express';
import CouponService from '../../modules/coupons/coupons.service';
declare class CouponController {
    couponService: CouponService;
    getCoupons: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCouponById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCouponByCode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    validateCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default CouponController;
