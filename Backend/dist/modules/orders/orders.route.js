"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const orders_controller_1 = tslib_1.__importDefault(require("../../modules/orders/orders.controller"));
const orders_dto_1 = require("../../modules/orders/orders.dto");
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
const permission_middleware_1 = require("../../middlewares/permission.middleware");
const roles_interface_1 = require("../roles/roles.interface");
class OrderRoute {
    constructor() {
        this.path = '/orders';
        this.router = (0, express_1.Router)();
        this.orderController = new orders_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, [auth_middleware_1.default], this.orderController.getOrders);
        this.router.get(`${this.path}/statistics`, auth_middleware_1.default, this.orderController.getOrderStatistics);
        this.router.get(`${this.path}/number/:orderNumber`, auth_middleware_1.default, this.orderController.getOrderByNumber);
        this.router.get(`${this.path}/user/:userId`, auth_middleware_1.default, this.orderController.getUserOrders);
        this.router.get(`${this.path}/status/:status`, auth_middleware_1.default, this.orderController.getOrdersByStatus);
        this.router.get(`${this.path}/date-range`, auth_middleware_1.default, this.orderController.getOrdersByDateRange);
        this.router.get(`${this.path}/:id`, auth_middleware_1.default, this.orderController.getOrderById);
        this.router.post(`${this.path}`, auth_middleware_1.default, (0, validation_middleware_1.default)(orders_dto_1.CreateOrderDto, 'body'), this.orderController.createOrder);
        this.router.post(`${this.path}/:id/resend-confirmation`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.CREATE_ORDER)], this.orderController.resendOrderConfirmation);
        this.router.put(`${this.path}/:id`, auth_middleware_1.default, (0, validation_middleware_1.default)(orders_dto_1.UpdateOrderDto, 'body', true), this.orderController.updateOrder);
        this.router.patch(`${this.path}/:id/status`, auth_middleware_1.default, (0, validation_middleware_1.default)(orders_dto_1.UpdateOrderStatusDto, 'body'), this.orderController.updateOrderStatus);
        this.router.patch(`${this.path}/:id/delivery`, auth_middleware_1.default, (0, validation_middleware_1.default)(orders_dto_1.UpdateDeliveryStatusDto, 'body'), this.orderController.updateDeliveryStatus);
        this.router.delete(`${this.path}/:id`, auth_middleware_1.default, this.orderController.deleteOrder);
    }
}
exports.default = OrderRoute;
//# sourceMappingURL=orders.route.js.map