"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cart_service_1 = tslib_1.__importDefault(require("../../modules/cart/cart.service"));
class CartController {
    constructor() {
        this.cartService = new cart_service_1.default();
        this.getCarts = async (req, res, next) => {
            try {
                const findAllCartsData = await this.cartService.findAllCarts();
                res.status(200).json({ data: findAllCartsData, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getCartById = async (req, res, next) => {
            try {
                const userId = req.user._id.toString();
                const findOneCartData = await this.cartService.findCartByUserId(userId);
                res.status(200).json({ data: findOneCartData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserActiveCart = async (req, res, next) => {
            try {
                const userId = req.params.userId;
                const findActiveCartData = await this.cartService.findUserActiveCart(userId);
                res.status(200).json({ data: findActiveCartData, message: 'findActiveCart' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createCart = async (req, res, next) => {
            try {
                const cartData = req.body;
                const createCartData = await this.cartService.createCart(cartData);
                res.status(201).json({ data: createCartData, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateCart = async (req, res, next) => {
            try {
                const cartId = req.params.id;
                const cartData = req.body;
                const updateCartData = await this.cartService.updateCart(cartId, cartData);
                res.status(200).json({ data: updateCartData, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.addItem = async (req, res, next) => {
            try {
                const userId = req.user._id.toString();
                const itemData = req.body;
                const updateCartData = await this.cartService.addItem(userId, itemData);
                res.status(200).json({ data: updateCartData, message: 'itemAdded' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateItem = async (req, res, next) => {
            try {
                const cartId = req.params.id;
                const productId = req.params.productId;
                const itemData = req.body;
                const updateCartData = await this.cartService.updateItem(cartId, productId, itemData);
                res.status(200).json({ data: updateCartData, message: 'itemUpdated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.removeItem = async (req, res, next) => {
            try {
                const cartId = req.params.id;
                const productId = req.params.productId;
                const selectedOptions = req.body.selectedOptions;
                const updateCartData = await this.cartService.removeItem(cartId, productId, selectedOptions);
                res.status(200).json({ data: updateCartData, message: 'itemRemoved' });
            }
            catch (error) {
                next(error);
            }
        };
        this.applyDiscount = async (req, res, next) => {
            try {
                const cartId = req.params.id;
                const discountData = req.body;
                const updateCartData = await this.cartService.applyDiscount(cartId, discountData);
                res.status(200).json({ data: updateCartData, message: 'discountApplied' });
            }
            catch (error) {
                next(error);
            }
        };
        this.removeDiscount = async (req, res, next) => {
            try {
                const cartId = req.params.id;
                const discountCode = req.params.code;
                const updateCartData = await this.cartService.removeDiscount(cartId, discountCode);
                res.status(200).json({ data: updateCartData, message: 'discountRemoved' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateShippingMethod = async (req, res, next) => {
            try {
                const cartId = req.params.id;
                const shippingData = req.body;
                const updateCartData = await this.cartService.updateShippingMethod(cartId, shippingData);
                res.status(200).json({ data: updateCartData, message: 'shippingMethodUpdated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteCart = async (req, res, next) => {
            try {
                const cartId = req.params.id;
                const deleteCartData = await this.cartService.deleteCart(cartId);
                res.status(200).json({ data: deleteCartData, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserCarts = async (req, res, next) => {
            try {
                const userId = req.params.userId;
                const findUserCartsData = await this.cartService.getUserCarts(userId);
                res.status(200).json({ data: findUserCartsData, message: 'findUserCarts' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getAbandonedCarts = async (req, res, next) => {
            try {
                const hours = parseInt(req.query.hours) || 24;
                const findAbandonedCartsData = await this.cartService.getAbandonedCarts(hours);
                res.status(200).json({ data: findAbandonedCartsData, message: 'findAbandonedCarts' });
            }
            catch (error) {
                next(error);
            }
        };
        this.markCartAsAbandoned = async (req, res, next) => {
            try {
                const cartId = req.params.id;
                const updateCartData = await this.cartService.markCartAsAbandoned(cartId);
                res.status(200).json({ data: updateCartData, message: 'markedAsAbandoned' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = CartController;
//# sourceMappingURL=cart.controller.js.map