import { NextFunction, Request, Response } from 'express';
import { CreateCartDto, UpdateCartDto, AddItemDto, UpdateItemDto, ApplyDiscountDto, UpdateShippingMethodDto } from '@/modules/cart/cart.dto';
import { Cart } from '@/modules/cart/cart.interface';
import CartService from '@/modules/cart/cart.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
class CartController {
  public cartService = new CartService();
  public getCarts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllCartsData: Cart[] = await this.cartService.findAllCarts();
      res.status(200).json({ data: findAllCartsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getCartById = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId: string = req.user._id.toString();
      const findOneCartData: Cart = await this.cartService.findCartByUserId(userId);
      res.status(200).json({ data: findOneCartData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public getUserActiveCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const findActiveCartData: Cart = await this.cartService.findUserActiveCart(userId);
      res.status(200).json({ data: findActiveCartData, message: 'findActiveCart' });
    } catch (error) {
      next(error);
    }
  };
  public createCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cartData: CreateCartDto = req.body;
      const createCartData: Cart = await this.cartService.createCart(cartData);
      res.status(201).json({ data: createCartData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cartId: string = req.params.id;
      const cartData: UpdateCartDto = req.body;
      const updateCartData: Cart = await this.cartService.updateCart(cartId, cartData);
      res.status(200).json({ data: updateCartData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public addItem = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user._id.toString();
      const itemData: AddItemDto = req.body;
      const updateCartData: Cart = await this.cartService.addItem(userId, itemData);
      res.status(200).json({ data: updateCartData, message: 'itemAdded' });
    } catch (error) {
      next(error);
    }
  };
  public updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cartId: string = req.params.id;
      const productId: string = req.params.productId;
      const itemData: UpdateItemDto = req.body;
      const updateCartData: Cart = await this.cartService.updateItem(cartId, productId, itemData);
      res.status(200).json({ data: updateCartData, message: 'itemUpdated' });
    } catch (error) {
      next(error);
    }
  };
  public removeItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cartId: string = req.params.id;
      const productId: string = req.params.productId;
      const selectedOptions: Record<string, any> = req.body.selectedOptions;
      const updateCartData: Cart = await this.cartService.removeItem(cartId, productId, selectedOptions);
      res.status(200).json({ data: updateCartData, message: 'itemRemoved' });
    } catch (error) {
      next(error);
    }
  };
  public applyDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cartId: string = req.params.id;
      const discountData: ApplyDiscountDto = req.body;
      const updateCartData: Cart = await this.cartService.applyDiscount(cartId, discountData);
      res.status(200).json({ data: updateCartData, message: 'discountApplied' });
    } catch (error) {
      next(error);
    }
  };
  public removeDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cartId: string = req.params.id;
      const discountCode: string = req.params.code;
      const updateCartData: Cart = await this.cartService.removeDiscount(cartId, discountCode);
      res.status(200).json({ data: updateCartData, message: 'discountRemoved' });
    } catch (error) {
      next(error);
    }
  };
  public updateShippingMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cartId: string = req.params.id;
      const shippingData: UpdateShippingMethodDto = req.body;
      const updateCartData: Cart = await this.cartService.updateShippingMethod(cartId, shippingData);
      res.status(200).json({ data: updateCartData, message: 'shippingMethodUpdated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cartId: string = req.params.id;
      const deleteCartData: Cart = await this.cartService.deleteCart(cartId);
      res.status(200).json({ data: deleteCartData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public getUserCarts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const findUserCartsData: Cart[] = await this.cartService.getUserCarts(userId);
      res.status(200).json({ data: findUserCartsData, message: 'findUserCarts' });
    } catch (error) {
      next(error);
    }
  };
  public getAbandonedCarts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hours: number = parseInt(req.query.hours as string) || 24;
      const findAbandonedCartsData: Cart[] = await this.cartService.getAbandonedCarts(hours);
      res.status(200).json({ data: findAbandonedCartsData, message: 'findAbandonedCarts' });
    } catch (error) {
      next(error);
    }
  };
  public markCartAsAbandoned = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cartId: string = req.params.id;
      const updateCartData: Cart = await this.cartService.markCartAsAbandoned(cartId);
      res.status(200).json({ data: updateCartData, message: 'markedAsAbandoned' });
    } catch (error) {
      next(error);
    }
  };
}
export default CartController;