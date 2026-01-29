"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HttpException_1 = require("../../exceptions/HttpException");
const cart_interface_1 = require("../../modules/cart/cart.interface");
const cart_model_1 = tslib_1.__importDefault(require("../../modules/cart/cart.model"));
const products_model_1 = tslib_1.__importDefault(require("../../modules/products/products.model"));
const orders_model_1 = tslib_1.__importDefault(require("../../modules/orders/orders.model"));
const products_interface_1 = require("../../modules/products/products.interface");
const orders_interface_1 = require("../../modules/orders/orders.interface");
const util_1 = require("../../utils/util");
const coupons_service_1 = tslib_1.__importDefault(require("../../modules/coupons/coupons.service"));
class CartService {
    constructor() {
        this.carts = cart_model_1.default;
        this.products = products_model_1.default;
        this.orders = orders_model_1.default;
        this.couponService = new coupons_service_1.default();
    }
    async findAllCarts() {
        const carts = await this.carts.find().populate('user').populate('items.product');
        return carts;
    }
    async findCartById(cartId) {
        if ((0, util_1.isEmpty)(cartId))
            throw new HttpException_1.HttpException(400, 'CartId is empty');
        const findCart = await this.carts.findOne({ _id: cartId }).populate('user').populate('items.product');
        if (!findCart)
            throw new HttpException_1.HttpException(409, "Cart doesn't exist");
        return findCart;
    }
    async findCartByUserId(userId) {
        if ((0, util_1.isEmpty)(userId))
            throw new HttpException_1.HttpException(400, 'UserId is empty');
        const findCart = await this.carts
            .findOne({ user: userId, status: cart_interface_1.CartStatus.ACTIVE })
            .populate('user')
            .populate({ path: 'items.product', populate: { path: 'albumId' } });
        if (!findCart) {
            return this.createCart({ user: userId, items: [] });
        }
        return findCart;
    }
    async findUserActiveCart(userId) {
        const findCart = await this.carts
            .findOne({
            user: userId,
            status: cart_interface_1.CartStatus.ACTIVE,
        })
            .populate('user')
            .populate('items.product');
        return findCart;
    }
    async createCart(cartData) {
        if ((0, util_1.isEmpty)(cartData))
            throw new HttpException_1.HttpException(400, 'cartData is empty');
        const existingCart = await this.findUserActiveCart(cartData.user);
        if (existingCart) {
            return existingCart;
        }
        if (cartData.items && cartData.items.length > 0) {
            await this.validateAndProcessItems(cartData.items);
        }
        const createCartData = await this.carts.create(Object.assign(Object.assign({}, cartData), { status: cart_interface_1.CartStatus.ACTIVE, lastActivityAt: new Date() }));
        return createCartData;
    }
    async updateCart(cartId, cartData) {
        if ((0, util_1.isEmpty)(cartData))
            throw new HttpException_1.HttpException(400, 'cartData is empty');
        const cart = await this.findCartById(cartId);
        if (cart.status === cart_interface_1.CartStatus.CONVERTED_TO_ORDER && cartData.status === cart_interface_1.CartStatus.CHECKOUT_IN_PROGRESS) {
            cartData.status = cart.status;
        }
        Object.assign(cart, cartData);
        cart.lastActivityAt = new Date();
        const updatedCart = await cart.save();
        return updatedCart.populate('user items.product');
    }
    async addItem(userId, itemData) {
        const cart = await this.findUserActiveCart(userId);
        if (!cart) {
            return this.createCart({ user: userId, items: [itemData.item] });
        }
        if (cart.status !== cart_interface_1.CartStatus.ACTIVE) {
            throw new HttpException_1.HttpException(400, `Cannot add items to ${cart.status} cart`);
        }
        const existingItem = cart.getItemById(itemData.item.product, itemData.item.selectedOptions);
        if (existingItem) {
            return this.updateItem(cart._id.toString(), itemData.item.product, {
                quantity: itemData.item.quantity,
                selectedOptions: itemData.item.selectedOptions,
                notes: itemData.item.notes,
            });
        }
        const processedItems = [itemData.item];
        await this.validateAndProcessItems(processedItems);
        const processedItem = processedItems[0];
        const updatedCart = await this.carts.findOneAndUpdate({ _id: cart._id }, {
            $push: { items: processedItem },
            $set: { lastActivityAt: new Date() },
            $inc: { itemCount: processedItem.quantity },
        }, {
            new: true,
            runValidators: true
        }).populate('user items.product');
        if (!updatedCart) {
            throw new HttpException_1.HttpException(404, 'Cart not found during update');
        }
        const items = updatedCart.items;
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalDiscount = updatedCart.discounts.reduce((sum, discount) => {
            if (discount.type === cart_interface_1.DiscountType.PERCENTAGE) {
                const discountAmount = subtotal * (discount.value / 100);
                return sum + (discount.maximumDiscount ? Math.min(discountAmount, discount.maximumDiscount) : discountAmount);
            }
            else if (discount.type === cart_interface_1.DiscountType.FIXED_AMOUNT) {
                return sum + discount.value;
            }
            return sum;
        }, 0);
        const finalCart = await this.carts.findOneAndUpdate({ _id: cart._id }, {
            $set: {
                subtotal,
                total: Math.max(0, subtotal + updatedCart.tax + updatedCart.shippingCost - totalDiscount)
            }
        }, {
            new: true,
            runValidators: true
        }).populate('user items.product');
        return finalCart;
    }
    async updateItem(cartId, productId, itemData) {
        const cart = await this.findCartById(cartId);
        if (cart.status !== cart_interface_1.CartStatus.ACTIVE) {
            throw new HttpException_1.HttpException(400, `Cannot update items in ${cart.status} cart`);
        }
        const itemIndex = cart.items.findIndex(item => {
            const itemProductId = typeof item.product === 'string' ? item.product : item.product._id.toString();
            if (itemProductId !== productId)
                return false;
            if (!item.selectedOptions)
                return !itemData.selectedOptions;
            return JSON.stringify(item.selectedOptions) === JSON.stringify(itemData.selectedOptions);
        });
        if (itemIndex === -1) {
            throw new HttpException_1.HttpException(404, 'Item not found in cart');
        }
        const product = await this.products.findById(productId);
        if (product.type === products_interface_1.ProductType.PHYSICAL && product.stockQuantity < itemData.quantity) {
            throw new HttpException_1.HttpException(400, `Insufficient stock for product ${product.sku}`);
        }
        cart.items[itemIndex].quantity = itemData.quantity;
        cart.items[itemIndex].selectedOptions = itemData.selectedOptions || cart.items[itemIndex].selectedOptions;
        cart.items[itemIndex].notes = itemData.notes || cart.items[itemIndex].notes;
        cart.items[itemIndex].updatedAt = new Date();
        cart.lastActivityAt = new Date();
        const updatedCart = await cart.save();
        return updatedCart.populate('user items.product');
    }
    async removeItem(cartId, productId, selectedOptions) {
        const cart = await this.findCartById(cartId);
        if (cart.status !== cart_interface_1.CartStatus.ACTIVE) {
            throw new HttpException_1.HttpException(400, `Cannot remove items from ${cart.status} cart`);
        }
        if (selectedOptions === null || selectedOptions === void 0 ? void 0 : selectedOptions.size) {
            cart.items = cart.items.filter(item => {
                const itemProductId = typeof item.product === 'string' ? item.product : item.product._id.toString();
                if (itemProductId !== productId)
                    return true;
                return JSON.stringify(item.selectedOptions) !== JSON.stringify(selectedOptions);
            });
        }
        else {
            cart.items = cart.items.filter(item => {
                const itemProductId = typeof item.product === 'string' ? item.product : item.product._id.toString();
                return itemProductId !== productId;
            });
        }
        cart.lastActivityAt = new Date();
        const updatedCart = await cart.save();
        return updatedCart.populate('items.product');
    }
    async isFirstPurchase(userId) {
        const completedOrders = await this.orders.countDocuments({
            user: userId,
            status: { $in: [orders_interface_1.OrderStatus.DELIVERED, orders_interface_1.OrderStatus.CONFIRMED, orders_interface_1.OrderStatus.PROCESSING, orders_interface_1.OrderStatus.SHIPPED] }
        });
        return completedOrders === 0;
    }
    async applyDiscount(cartId, discountData) {
        const cart = await this.findCartById(cartId);
        if (cart.status !== cart_interface_1.CartStatus.ACTIVE) {
            throw new HttpException_1.HttpException(400, `Cannot apply discount to ${cart.status} cart`);
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
            throw new HttpException_1.HttpException(400, validationResult.message || 'Invalid coupon');
        }
        const discount = {
            code: discountData.code,
            type: cart_interface_1.DiscountType.FIXED_AMOUNT,
            value: validationResult.discount,
            description: `Discount applied: ${discountData.code}`,
            appliedAt: new Date(),
        };
        cart.discounts = [discount];
        cart.lastActivityAt = new Date();
        const updatedCart = await cart.save();
        return updatedCart.populate('user items.product');
    }
    async removeDiscount(cartId, discountCode) {
        const cart = await this.findCartById(cartId);
        if (cart.status !== cart_interface_1.CartStatus.ACTIVE) {
            throw new HttpException_1.HttpException(400, `Cannot remove discount from ${cart.status} cart`);
        }
        cart.discounts = cart.discounts.filter(discount => discount.code !== discountCode);
        cart.lastActivityAt = new Date();
        const updatedCart = await cart.save();
        return updatedCart.populate('user items.product');
    }
    async updateShippingMethod(cartId, shippingData) {
        var _a;
        const cart = await this.findCartById(cartId);
        if (cart.status !== cart_interface_1.CartStatus.ACTIVE) {
            throw new HttpException_1.HttpException(400, `Cannot update shipping method for ${cart.status} cart`);
        }
        const selectedMethod = (_a = cart.shippingEstimates) === null || _a === void 0 ? void 0 : _a.find(estimate => estimate.method === shippingData.method && estimate.isAvailable);
        if (!selectedMethod) {
            throw new HttpException_1.HttpException(400, 'Invalid or unavailable shipping method');
        }
        cart.selectedShippingMethod = shippingData.method;
        cart.shippingCost = selectedMethod.cost;
        cart.lastActivityAt = new Date();
        const updatedCart = await cart.save();
        return updatedCart.populate('user items.product');
    }
    async deleteCart(cartId) {
        const cart = await this.findCartById(cartId);
        if (![cart_interface_1.CartStatus.ABANDONED, cart_interface_1.CartStatus.EXPIRED].includes(cart.status)) {
            throw new HttpException_1.HttpException(400, 'Only abandoned or expired carts can be deleted');
        }
        const deleteCartById = await this.carts.findByIdAndDelete(cartId);
        return deleteCartById;
    }
    async validateAndProcessItems(items) {
        await Promise.all(items.map(async (item) => {
            const product = await this.products.findById(item.product);
            if (!product) {
                throw new HttpException_1.HttpException(404, `Product ${item.product} not found`);
            }
            if (product.type === products_interface_1.ProductType.PHYSICAL && product.stockQuantity < item.quantity) {
                throw new HttpException_1.HttpException(400, `Insufficient stock for product ${product.sku}`);
            }
            item.price = product.price;
            item.total = product.price * item.quantity;
            item.addedAt = new Date();
        }));
    }
    async getUserCarts(userId) {
        return this.carts.find({ user: userId }).populate('user').populate('items.product').sort({ lastActivityAt: -1 });
    }
    async getCartsByStatus(status) {
        return this.carts.find({ status }).populate('user').populate('items.product').sort({ lastActivityAt: -1 });
    }
    async getAbandonedCarts(hours) {
        const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.carts
            .find({
            status: cart_interface_1.CartStatus.ACTIVE,
            lastActivityAt: { $lt: cutoffDate },
        })
            .populate('user')
            .populate('items.product')
            .sort({ lastActivityAt: 1 });
    }
    async markCartAsAbandoned(cartId) {
        const cart = await this.findCartById(cartId);
        cart.status = cart_interface_1.CartStatus.ABANDONED;
        cart.lastActivityAt = new Date();
        const updatedCart = await cart.save();
        return updatedCart.populate('user items.product');
    }
}
exports.default = CartService;
//# sourceMappingURL=cart.service.js.map