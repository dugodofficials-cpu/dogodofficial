import { Router } from 'express';
import OrderController from '@backend/orders/orders.controller';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderStatusDto, UpdateDeliveryStatusDto, BulkDeleteOrdersDto } from '@backend/orders/orders.dto';
import { Routes } from '@backend/interfaces/routes.interface';
import validationMiddleware from '@backend/middlewares/validation.middleware';
import authMiddleware from '@backend/middlewares/auth.middleware';
import { orderCreateLimiter } from '@backend/middlewares/rateLimit.middleware';
import { hasPermission } from '@backend/middlewares/permission.middleware';
import { selfOrPermission } from '@backend/middlewares/selfOrPermission.middleware';
import { Permission } from '../roles/roles.interface';
class OrderRoute implements Routes {
  public path = '/orders';
  public router = Router();
  public orderController = new OrderController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    // Whole-system order browsing (unfiltered by owner) is admin-only.
    this.router.get(`${this.path}`, [authMiddleware, hasPermission(Permission.READ_ORDER)], this.orderController.getOrders);
    this.router.get(`${this.path}/statistics`, [authMiddleware, hasPermission(Permission.READ_ORDER)], this.orderController.getOrderStatistics);
    this.router.get(`${this.path}/number/:orderNumber`, [authMiddleware, hasPermission(Permission.READ_ORDER)], this.orderController.getOrderByNumber);
    // A customer may fetch their own order history; anyone else needs READ_ORDER.
    this.router.get(`${this.path}/user/:userId`, [authMiddleware, selfOrPermission(Permission.READ_ORDER, 'userId')], this.orderController.getUserOrders);
    this.router.get(`${this.path}/status/:status`, [authMiddleware, hasPermission(Permission.READ_ORDER)], this.orderController.getOrdersByStatus);
    this.router.get(`${this.path}/date-range`, [authMiddleware, hasPermission(Permission.READ_ORDER)], this.orderController.getOrdersByDateRange);
    this.router.patch(
      `${this.path}/bulk-delete`,
      [authMiddleware, hasPermission(Permission.DELETE_ORDER)],
      validationMiddleware(BulkDeleteOrdersDto, 'body'),
      this.orderController.bulkDeleteOrders,
    );
    this.router.get(`${this.path}/:id`, authMiddleware, this.orderController.getOrderById);
    this.router.post(`${this.path}`, [authMiddleware, orderCreateLimiter], validationMiddleware(CreateOrderDto, 'body'), this.orderController.createOrder);
    this.router.post(`${this.path}/:id/resend-confirmation`, [authMiddleware, hasPermission(Permission.CREATE_ORDER)], this.orderController.resendOrderConfirmation);
    this.router.put(`${this.path}/:id`, [authMiddleware, hasPermission(Permission.UPDATE_ORDER)], validationMiddleware(UpdateOrderDto, 'body', true), this.orderController.updateOrder);
    this.router.patch(`${this.path}/:id/status`, [authMiddleware, hasPermission(Permission.UPDATE_ORDER)], validationMiddleware(UpdateOrderStatusDto, 'body'), this.orderController.updateOrderStatus);
    this.router.patch(`${this.path}/:id/delivery`, [authMiddleware, hasPermission(Permission.UPDATE_ORDER)], validationMiddleware(UpdateDeliveryStatusDto, 'body'), this.orderController.updateDeliveryStatus);
    this.router.delete(`${this.path}/:id`, [authMiddleware, hasPermission(Permission.DELETE_ORDER)], this.orderController.deleteOrder);
  }
}
export default OrderRoute;