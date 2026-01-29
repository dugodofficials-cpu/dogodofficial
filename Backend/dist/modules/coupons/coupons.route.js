"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const coupons_controller_1 = tslib_1.__importDefault(require("../../modules/coupons/coupons.controller"));
const coupons_dto_1 = require("../../modules/coupons/coupons.dto");
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
const permission_middleware_1 = require("../../middlewares/permission.middleware");
const roles_interface_1 = require("../roles/roles.interface");
class CouponRoute {
    constructor() {
        this.path = '/coupons';
        this.router = (0, express_1.Router)();
        this.couponController = new coupons_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_COUPON)], this.couponController.getCoupons);
        this.router.get(`${this.path}/:id`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_COUPON)], this.couponController.getCouponById);
        this.router.post(`${this.path}`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.CREATE_COUPON), (0, validation_middleware_1.default)(coupons_dto_1.CreateCouponDto, 'body')], this.couponController.createCoupon);
        this.router.put(`${this.path}/:id`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPDATE_COUPON), (0, validation_middleware_1.default)(coupons_dto_1.UpdateCouponDto, 'body', true)], this.couponController.updateCoupon);
        this.router.delete(`${this.path}/:id`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.DELETE_COUPON)], this.couponController.deleteCoupon);
        this.router.get(`${this.path}/code/:code`, auth_middleware_1.default, this.couponController.getCouponByCode);
        this.router.post(`${this.path}/validate`, [auth_middleware_1.default, (0, validation_middleware_1.default)(coupons_dto_1.ValidateCouponDto, 'body')], this.couponController.validateCoupon);
    }
}
exports.default = CouponRoute;
//# sourceMappingURL=coupons.route.js.map