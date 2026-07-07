import { NextFunction, Request, Response } from 'express';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from '@backend/coupons/coupons.dto';
import { Coupon } from '@backend/coupons/coupons.interface';
import CouponService from '@backend/coupons/coupons.service';
class CouponController {
  public couponService = new CouponService();
  public getCoupons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllCouponsData: Coupon[] = await this.couponService.findAllCoupons();
      res.status(200).json({ data: findAllCouponsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getCouponById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const couponId: string = req.params.id;
      const findOneCouponData: Coupon = await this.couponService.findCouponById(couponId);
      res.status(200).json({ data: findOneCouponData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public getCouponByCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code: string = req.params.code;
      const findOneCouponData: Coupon = await this.couponService.findCouponByCode(code);
      res.status(200).json({ data: findOneCouponData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const couponData: CreateCouponDto = req.body;
      const createCouponData: Coupon = await this.couponService.createCoupon(couponData);
      res.status(201).json({ data: createCouponData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const couponId: string = req.params.id;
      const couponData: UpdateCouponDto = req.body;
      const updateCouponData: Coupon = await this.couponService.updateCoupon(couponId, couponData);
      res.status(200).json({ data: updateCouponData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const couponId: string = req.params.id;
      const deleteCouponData: Coupon = await this.couponService.deleteCoupon(couponId);
      res.status(200).json({ data: deleteCouponData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public validateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validationData: ValidateCouponDto = req.body;
      const validationResult = await this.couponService.validateCoupon(validationData);
      res.status(200).json({ data: validationResult, message: 'validated' });
    } catch (error) {
      next(error);
    }
  };
}
export default CouponController;