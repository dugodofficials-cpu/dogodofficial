import { CreateCartDto, UpdateCartDto, AddItemDto, UpdateItemDto, ApplyDiscountDto, UpdateShippingMethodDto } from '@/modules/cart/cart.dto';
import { HttpException } from '@exceptions/HttpException';
import { Cart, CartStatus, DiscountType, CartItem } from '@/modules/cart/cart.interface';
import cartModel from '@/modules/cart/cart.model';
import productModel from '@/modules/products/products.model';
import orderModel from '@/modules/orders/orders.model';
import { Product, ProductType } from '@/modules/products/products.interface';
import { OrderStatus } from '@/modules/orders/orders.interface';
import { isEmpty } from '@utils/util';
import { Document } from 'mongoose';
import CouponService from '@/modules/coupons/coupons.service';
class CartService {
  public carts = cartModel;
  public products = productModel;
  public orders = orderModel;
  public couponService = new CouponService();
  public async findAllCarts(): Promise<Cart[]> {
    const carts: Cart[] = await this.carts.find().populate('user').populate('items.product');
    return carts;
  }
  public async findCartById(cartId: string): Promise<Cart> {
    if (isEmpty(cartId)) throw new HttpException(400, 'CartId is empty');
    const findCart: Cart = await this.carts.findOne({ _id: cartId }).populate('user').populate('items.product');
    if (!findCart) throw new HttpException(409, "Cart doesn't exist");
    return findCart;
  }
  public async findCartByUserId(userId: string): Promise<Cart> {
    if (isEmpty(userId)) throw new HttpException(400, 'UserId is empty');
    const findCart: Cart = await this.carts
      .findOne({ user: userId, status: CartStatus.ACTIVE })
      .populate('user')
      .populate({ path: 'items.product', populate: { path: 'albumId' } });
    if (!findCart) {
      return this.createCart({ user: userId, items: [] });
    }
    return findCart;
  }
  public async findUserActiveCart(userId: string): Promise<Cart> {
    const findCart: Cart = await this.carts
      .findOne({
        user: userId,
        status: CartStatus.ACTIVE,
      })
      .populate('user')
      .populate('items.product');
    return findCart;
  }
  public async createCart(cartData: CreateCartDto): Promise<Cart> {
    if (isEmpty(cartData)) throw new HttpException(400, 'cartData is empty');
    const existingCart = await this.findUserActiveCart(cartData.user);
    if (existingCart) {
      return existingCart;
    }
    if (cartData.items && cartData.items.length > 0) {
      await this.validateAndProcessItems(cartData.items);
    }
    const createCartData: Cart = await this.carts.create({
      ...cartData,
      status: CartStatus.ACTIVE,
      lastActivityAt: new Date(),
    });
    return createCartData;
  }
  public async updateCart(cartId: string, cartData: UpdateCartDto): Promise<Cart> {
    if (isEmpty(cartData)) throw new HttpException(400, 'cartData is empty');
    const cart = await this.findCartById(cartId) as (Document & Cart);
    if (cart.status === CartStatus.CONVERTED_TO_ORDER && cartData.status === CartStatus.CHECKOUT_IN_PROGRESS) {
      cartData.status = cart.status;
    }
    Object.assign(cart, cartData);
    cart.lastActivityAt = new Date();
    const updatedCart = await cart.save();
    return updatedCart.populate('user items.product');
  }
  public async addItem(userId: string, itemData: AddItemDto): Promise<Cart> {
    const cart = await this.findUserActiveCart(userId) as (Document & Cart) | null;
    if (!cart) {
      return this.createCart({ user: userId, items: [itemData.item] });
    }
    if (cart.status !== CartStatus.ACTIVE) {
      throw new HttpException(400, `Cannot add items to ${cart.status} cart`);
    }
    const existingItem = (cart as any).getItemById(itemData.item.product, itemData.item.selectedOptions);
    if (existingItem) {
      return this.updateItem(cart._id.toString(), itemData.item.product, {
        quantity: itemData.item.quantity,
        selectedOptions: itemData.item.selectedOptions,
        notes: itemData.item.notes,
      });
    }
    const processedItems = [itemData.item];
    await this.validateAndProcessItems(processedItems);
    const processedItem = processedItems[0] as CartItem;
    const updatedCart = await this.carts.findOneAndUpdate(
      { _id: cart._id },
      {
        $push: { items: processedItem },
        $set: { lastActivityAt: new Date() },
        $inc: { itemCount: processedItem.quantity },
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('user items.product');
    if (!updatedCart) {
      throw new HttpException(404, 'Cart not found during update');
    }
    const items = updatedCart.items;
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiscount = updatedCart.discounts.reduce((sum, discount) => {
      if (discount.type === DiscountType.PERCENTAGE) {
        const discountAmount = subtotal * (discount.value / 100);
        return sum + (discount.maximumDiscount ? Math.min(discountAmount, discount.maximumDiscount) : discountAmount);
      } else if (discount.type === DiscountType.FIXED_AMOUNT) {
        return sum + discount.value;
      }
      return sum;
    }, 0);
    const finalCart = await this.carts.findOneAndUpdate(
      { _id: cart._id },
      {
        $set: {
          subtotal,
          total: Math.max(0, subtotal + updatedCart.tax + updatedCart.shippingCost - totalDiscount)
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('user items.product');
    return finalCart;
  }
  public async updateItem(cartId: string, productId: string, itemData: UpdateItemDto): Promise<Cart> {
    const cart = await this.findCartById(cartId) as (Document & Cart);
    if (cart.status !== CartStatus.ACTIVE) {
      throw new HttpException(400, `Cannot update items in ${cart.status} cart`);
    }
    const itemIndex = cart.items.findIndex(item => {
      const itemProductId = typeof item.product === 'string' ? item.product : item.product._id.toString();
      if (itemProductId !== productId) return false;
      if (!item.selectedOptions) return !itemData.selectedOptions;
      return JSON.stringify(item.selectedOptions) === JSON.stringify(itemData.selectedOptions);
    });
    if (itemIndex === -1) {
      throw new HttpException(404, 'Item not found in cart');
    }
    const product = await this.products.findById(productId);
    if (product.type === ProductType.PHYSICAL && product.stockQuantity < itemData.quantity) {
      throw new HttpException(400, `Insufficient stock for product ${product.sku}`);
    }
    cart.items[itemIndex].quantity = itemData.quantity;
    cart.items[itemIndex].selectedOptions = itemData.selectedOptions || cart.items[itemIndex].selectedOptions;
    cart.items[itemIndex].notes = itemData.notes || cart.items[itemIndex].notes;
    cart.items[itemIndex].updatedAt = new Date();
    cart.lastActivityAt = new Date();
    const updatedCart = await cart.save();
    return updatedCart.populate('user items.product');
  }
  public async removeItem(cartId: string, productId: string, selectedOptions: Record<string, any>): Promise<Cart> {
    const cart = await this.findCartById(cartId) as (Document & Cart);
    if (cart.status !== CartStatus.ACTIVE) {
      throw new HttpException(400, `Cannot remove items from ${cart.status} cart`);
    }
    if (selectedOptions?.size) {
      cart.items = cart.items.filter(item => {
        const itemProductId = typeof item.product === 'string' ? item.product : item.product._id.toString();
        if (itemProductId !== productId) return true;
        return JSON.stringify(item.selectedOptions) !== JSON.stringify(selectedOptions);
      });
    } else {
      cart.items = cart.items.filter(item => {
        const itemProductId = typeof item.product === 'string' ? item.product : item.product._id.toString();
        return itemProductId !== productId;
      });
    }
    cart.lastActivityAt = new Date();
    const updatedCart = await cart.save();
    return updatedCart.populate('items.product');
  }
  private async isFirstPurchase(userId: string): Promise<boolean> {
    const completedOrders = await this.orders.countDocuments({
      user: userId,
      status: { $in: [OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
    });
    return completedOrders === 0;
  }
  public async applyDiscount(cartId: string, discountData: ApplyDiscountDto): Promise<Cart> {
    const cart = await this.findCartById(cartId) as (Document & Cart);
    if (cart.status !== CartStatus.ACTIVE) {
      throw new HttpException(400, `Cannot apply discount to ${cart.status} cart`);
    }
    const productIds = cart.items.map(item => {
      return typeof item.product === 'string' ? item.product : item.product._id.toString();
    });
    const isFirstPurchase = true;
    const validationResult = await this.couponService.validateCoupon({
      code: discountData.code,
      cartTotal: cart.subtotal,
      productIds,
      isFirstPurchase,
    });
    if (!validationResult.isValid) {
      throw new HttpException(400, validationResult.message || 'Invalid coupon');
    }
    const discount = {
      code: discountData.code,
      type: DiscountType.FIXED_AMOUNT,
      value: validationResult.discount,
      description: `Discount applied: ${discountData.code}`,
      appliedAt: new Date(),
    };
    cart.discounts = [discount];
    cart.lastActivityAt = new Date();
    const updatedCart = await cart.save();
    return updatedCart.populate('user items.product');
  }
  public async removeDiscount(cartId: string, discountCode: string): Promise<Cart> {
    const cart = await this.findCartById(cartId) as (Document & Cart);
    if (cart.status !== CartStatus.ACTIVE) {
      throw new HttpException(400, `Cannot remove discount from ${cart.status} cart`);
    }
    cart.discounts = cart.discounts.filter(discount => discount.code !== discountCode);
    cart.lastActivityAt = new Date();
    const updatedCart = await cart.save();
    return updatedCart.populate('user items.product');
  }
  public async updateShippingMethod(cartId: string, shippingData: UpdateShippingMethodDto): Promise<Cart> {
    const cart = await this.findCartById(cartId) as (Document & Cart);
    if (cart.status !== CartStatus.ACTIVE) {
      throw new HttpException(400, `Cannot update shipping method for ${cart.status} cart`);
    }
    const selectedMethod = cart.shippingEstimates?.find(estimate => estimate.method === shippingData.method && estimate.isAvailable);
    if (!selectedMethod) {
      throw new HttpException(400, 'Invalid or unavailable shipping method');
    }
    cart.selectedShippingMethod = shippingData.method;
    cart.shippingCost = selectedMethod.cost;
    cart.lastActivityAt = new Date();
    const updatedCart = await cart.save();
    return updatedCart.populate('user items.product');
  }
  public async deleteCart(cartId: string): Promise<Cart> {
    const cart = await this.findCartById(cartId);
    if (![CartStatus.ABANDONED, CartStatus.EXPIRED].includes(cart.status)) {
      throw new HttpException(400, 'Only abandoned or expired carts can be deleted');
    }
    const deleteCartById: Cart = await this.carts.findByIdAndDelete(cartId);
    return deleteCartById;
  }
  private async validateAndProcessItems(items: any[]): Promise<void> {
    await Promise.all(
      items.map(async item => {
        const product = await this.products.findById(item.product);
        if (!product) {
          throw new HttpException(404, `Product ${item.product} not found`);
        }
        if (product.type === ProductType.PHYSICAL && product.stockQuantity < item.quantity) {
          throw new HttpException(400, `Insufficient stock for product ${product.sku}`);
        }
        item.price = product.price;
        item.total = product.price * item.quantity;
        item.addedAt = new Date();
      }),
    );
  }
  public async getUserCarts(userId: string): Promise<Cart[]> {
    return this.carts.find({ user: userId }).populate('user').populate('items.product').sort({ lastActivityAt: -1 });
  }
  public async getCartsByStatus(status: CartStatus): Promise<Cart[]> {
    return this.carts.find({ status }).populate('user').populate('items.product').sort({ lastActivityAt: -1 });
  }
  public async getAbandonedCarts(hours: number): Promise<Cart[]> {
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.carts
      .find({
        status: CartStatus.ACTIVE,
        lastActivityAt: { $lt: cutoffDate },
      })
      .populate('user')
      .populate('items.product')
      .sort({ lastActivityAt: 1 });
  }
  public async markCartAsAbandoned(cartId: string): Promise<Cart> {
    const cart = await this.findCartById(cartId) as (Document & Cart);
    cart.status = CartStatus.ABANDONED;
    cart.lastActivityAt = new Date();
    const updatedCart = await cart.save();
    return updatedCart.populate('user items.product');
  }
}
export default CartService;