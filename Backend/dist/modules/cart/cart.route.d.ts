import { Routes } from '../../interfaces/routes.interface';
import CartController from '../../modules/cart/cart.controller';
declare class CartRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    cartController: CartController;
    constructor();
    private initializeRoutes;
}
export default CartRoute;
