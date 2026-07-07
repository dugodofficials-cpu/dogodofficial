import { Router } from 'express';
import CouponController from '@backend/coupons/coupons.controller';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from '@backend/coupons/coupons.dto';
import { Routes } from '@backend/interfaces/routes.interface';
import validationMiddleware from '@backend/middlewares/validation.middleware';
import authMiddleware from '@backend/middlewares/auth.middleware';
import { hasPermission as permissionMiddleware } from '@backend/middlewares/permission.middleware';
import { Permission } from '../roles/roles.interface';
class CouponRoute implements Routes {
  public path = '/coupons';
  public router = Router();
  public couponController = new CouponController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, [authMiddleware, permissionMiddleware(Permission.READ_COUPON)], this.couponController.getCoupons);
    this.router.get(`${this.path}/:id`, [authMiddleware, permissionMiddleware(Permission.READ_COUPON)], this.couponController.getCouponById);
    this.router.post(
      `${this.path}`,
      [authMiddleware, permissionMiddleware(Permission.CREATE_COUPON), validationMiddleware(CreateCouponDto, 'body')],
      this.couponController.createCoupon,
    );
    this.router.put(
      `${this.path}/:id`,
      [authMiddleware, permissionMiddleware(Permission.UPDATE_COUPON), validationMiddleware(UpdateCouponDto, 'body', true)],
      this.couponController.updateCoupon,
    );
    this.router.delete(
      `${this.path}/:id`,
      [authMiddleware, permissionMiddleware(Permission.DELETE_COUPON)],
      this.couponController.deleteCoupon,
    );
    this.router.get(`${this.path}/code/:code`, authMiddleware, this.couponController.getCouponByCode);
    this.router.post(
      `${this.path}/validate`,
      [authMiddleware, validationMiddleware(ValidateCouponDto, 'body')],
      this.couponController.validateCoupon,
    );
  }
}
export default CouponRoute;