import { Routes } from '../../interfaces/routes.interface';
import ShippingController from '../../modules/shipping/shipping.controller';
declare class ShippingRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    shippingController: ShippingController;
    constructor();
    private initializeRoutes;
}
export default ShippingRoute;
