import { NextFunction, Request, Response } from 'express';
import CartService from '../../modules/cart/cart.service';
import { RequestWithUser } from '../../interfaces/auth.interface';
declare class CartController {
    cartService: CartService;
    getCarts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCartById: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    getUserActiveCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addItem: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    updateItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removeItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    applyDiscount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removeDiscount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateShippingMethod: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserCarts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAbandonedCarts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markCartAsAbandoned: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default CartController;
