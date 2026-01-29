"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const cart_controller_1 = tslib_1.__importDefault(require("../../modules/cart/cart.controller"));
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
const cart_dto_1 = require("../../modules/cart/cart.dto");
class CartRoute {
    constructor() {
        this.path = '/cart';
        this.router = (0, express_1.Router)();
        this.cartController = new cart_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, auth_middleware_1.default, this.cartController.getCarts);
        this.router.get(`${this.path}/active`, auth_middleware_1.default, this.cartController.getCartById);
        this.router.get(`${this.path}/user/:userId/active`, auth_middleware_1.default, this.cartController.getUserActiveCart);
        this.router.post(`${this.path}`, auth_middleware_1.default, (0, validation_middleware_1.default)(cart_dto_1.CreateCartDto, 'body'), this.cartController.createCart);
        this.router.put(`${this.path}/:id`, auth_middleware_1.default, (0, validation_middleware_1.default)(cart_dto_1.UpdateCartDto, 'body'), this.cartController.updateCart);
        this.router.post(`${this.path}/add`, auth_middleware_1.default, (0, validation_middleware_1.default)(cart_dto_1.AddItemDto, 'body'), this.cartController.addItem);
        this.router.put(`${this.path}/:id/items/:productId`, auth_middleware_1.default, (0, validation_middleware_1.default)(cart_dto_1.UpdateItemDto, 'body'), this.cartController.updateItem);
        this.router.put(`${this.path}/:id/remove/:productId`, auth_middleware_1.default, this.cartController.removeItem);
        this.router.post(`${this.path}/:id/discounts`, auth_middleware_1.default, (0, validation_middleware_1.default)(cart_dto_1.ApplyDiscountDto, 'body'), this.cartController.applyDiscount);
        this.router.delete(`${this.path}/:id/discounts/:code`, auth_middleware_1.default, this.cartController.removeDiscount);
        this.router.put(`${this.path}/:id/shipping`, auth_middleware_1.default, (0, validation_middleware_1.default)(cart_dto_1.UpdateShippingMethodDto, 'body'), this.cartController.updateShippingMethod);
        this.router.delete(`${this.path}/:id`, auth_middleware_1.default, this.cartController.deleteCart);
        this.router.get(`${this.path}/user/:userId`, auth_middleware_1.default, this.cartController.getUserCarts);
        this.router.get(`${this.path}/abandoned`, auth_middleware_1.default, this.cartController.getAbandonedCarts);
        this.router.put(`${this.path}/:id/abandon`, auth_middleware_1.default, this.cartController.markCartAsAbandoned);
    }
}
exports.default = CartRoute;
//# sourceMappingURL=cart.route.js.map