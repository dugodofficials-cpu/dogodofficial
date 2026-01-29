import CouponController from '../../modules/coupons/coupons.controller';
import { Routes } from '../../interfaces/routes.interface';
declare class CouponRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    couponController: CouponController;
    constructor();
    private initializeRoutes;
}
export default CouponRoute;
