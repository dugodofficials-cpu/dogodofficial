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
/// <reference types="mongoose/types/inferschematype" />
import { CreateCartDto, UpdateCartDto, AddItemDto, UpdateItemDto, ApplyDiscountDto, UpdateShippingMethodDto } from '../../modules/cart/cart.dto';
import { Cart, CartStatus } from '../../modules/cart/cart.interface';
import { Product } from '../../modules/products/products.interface';
import { Document } from 'mongoose';
import CouponService from '../../modules/coupons/coupons.service';
declare class CartService {
    carts: import("mongoose").Model<Cart & Document<any, any, any>, {}, {}, {}, any>;
    products: import("mongoose").Model<Product & Document<any, any, any>, {}, {}, {}, any>;
    orders: import("mongoose").Model<import("../../modules/orders/orders.interface").Order & Document<any, any, any>, {}, {}, {}, any>;
    couponService: CouponService;
    findAllCarts(): Promise<Cart[]>;
    findCartById(cartId: string): Promise<Cart>;
    findCartByUserId(userId: string): Promise<Cart>;
    findUserActiveCart(userId: string): Promise<Cart>;
    createCart(cartData: CreateCartDto): Promise<Cart>;
    updateCart(cartId: string, cartData: UpdateCartDto): Promise<Cart>;
    addItem(userId: string, itemData: AddItemDto): Promise<Cart>;
    updateItem(cartId: string, productId: string, itemData: UpdateItemDto): Promise<Cart>;
    removeItem(cartId: string, productId: string, selectedOptions: Record<string, any>): Promise<Cart>;
    private isFirstPurchase;
    applyDiscount(cartId: string, discountData: ApplyDiscountDto): Promise<Cart>;
    removeDiscount(cartId: string, discountCode: string): Promise<Cart>;
    updateShippingMethod(cartId: string, shippingData: UpdateShippingMethodDto): Promise<Cart>;
    deleteCart(cartId: string): Promise<Cart>;
    private validateAndProcessItems;
    getUserCarts(userId: string): Promise<Cart[]>;
    getCartsByStatus(status: CartStatus): Promise<Cart[]>;
    getAbandonedCarts(hours: number): Promise<Cart[]>;
    markCartAsAbandoned(cartId: string): Promise<Cart>;
}
export default CartService;
