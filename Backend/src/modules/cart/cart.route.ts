import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import CartController from '@/modules/cart/cart.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import { cartWriteLimiter } from '@middlewares/rateLimit.middleware';
import { CreateCartDto, UpdateCartDto, AddItemDto, UpdateItemDto, ApplyDiscountDto, UpdateShippingMethodDto } from '@/modules/cart/cart.dto';
class CartRoute implements Routes {
  public path = '/cart';
  public router = Router();
  public cartController = new CartController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.cartController.getCarts);
    this.router.get(`${this.path}/active`, authMiddleware, this.cartController.getCartById);
    this.router.get(`${this.path}/user/:userId/active`, authMiddleware, this.cartController.getUserActiveCart);
    this.router.post(`${this.path}`, [authMiddleware, cartWriteLimiter], validationMiddleware(CreateCartDto, 'body'), this.cartController.createCart);
    this.router.put(`${this.path}/:id`, [authMiddleware, cartWriteLimiter], validationMiddleware(UpdateCartDto, 'body'), this.cartController.updateCart);
    this.router.post(`${this.path}/add`, [authMiddleware, cartWriteLimiter], validationMiddleware(AddItemDto, 'body'), this.cartController.addItem);
    this.router.put(`${this.path}/:id/items/:productId`, authMiddleware, validationMiddleware(UpdateItemDto, 'body'), this.cartController.updateItem);
    this.router.put(`${this.path}/:id/remove/:productId`, authMiddleware, this.cartController.removeItem);
    this.router.post(`${this.path}/:id/discounts`, authMiddleware, validationMiddleware(ApplyDiscountDto, 'body'), this.cartController.applyDiscount);
    this.router.delete(`${this.path}/:id/discounts/:code`, authMiddleware, this.cartController.removeDiscount);
    this.router.put(
      `${this.path}/:id/shipping`,
      authMiddleware,
      validationMiddleware(UpdateShippingMethodDto, 'body'),
      this.cartController.updateShippingMethod,
    );
    this.router.delete(`${this.path}/:id`, authMiddleware, this.cartController.deleteCart);
    this.router.get(`${this.path}/user/:userId`, authMiddleware, this.cartController.getUserCarts);
    this.router.get(`${this.path}/abandoned`, authMiddleware, this.cartController.getAbandonedCarts);
    this.router.put(`${this.path}/:id/abandon`, authMiddleware, this.cartController.markCartAsAbandoned);
  }
}
export default CartRoute;