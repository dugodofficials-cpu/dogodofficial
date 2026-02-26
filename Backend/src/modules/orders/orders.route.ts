import { Router } from 'express';
import OrderController from '@/modules/orders/orders.controller';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderStatusDto, UpdateDeliveryStatusDto } from '@/modules/orders/orders.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import { hasPermission } from '@/middlewares/permission.middleware';
import { Permission } from '../roles/roles.interface';
class OrderRoute implements Routes {
  public path = '/orders';
  public router = Router();
  public orderController = new OrderController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, [authMiddleware], this.orderController.getOrders);
    this.router.get(`${this.path}/statistics`, authMiddleware, this.orderController.getOrderStatistics);
    this.router.get(`${this.path}/number/:orderNumber`, authMiddleware, this.orderController.getOrderByNumber);
    this.router.get(`${this.path}/user/:userId`, authMiddleware, this.orderController.getUserOrders);
    this.router.get(`${this.path}/status/:status`, authMiddleware, this.orderController.getOrdersByStatus);
    this.router.get(`${this.path}/date-range`, authMiddleware, this.orderController.getOrdersByDateRange);
    this.router.get(`${this.path}/:id`, authMiddleware, this.orderController.getOrderById);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateOrderDto, 'body'), this.orderController.createOrder);
    this.router.post(`${this.path}/:id/resend-confirmation`, [authMiddleware, hasPermission(Permission.CREATE_ORDER)], this.orderController.resendOrderConfirmation);
    this.router.put(`${this.path}/:id`, [authMiddleware, hasPermission(Permission.UPDATE_ORDER)], validationMiddleware(UpdateOrderDto, 'body', true), this.orderController.updateOrder);
    this.router.patch(`${this.path}/:id/status`, [authMiddleware, hasPermission(Permission.UPDATE_ORDER)], validationMiddleware(UpdateOrderStatusDto, 'body'), this.orderController.updateOrderStatus);
    this.router.patch(`${this.path}/:id/delivery`, [authMiddleware, hasPermission(Permission.UPDATE_ORDER)], validationMiddleware(UpdateDeliveryStatusDto, 'body'), this.orderController.updateDeliveryStatus);
    this.router.delete(`${this.path}/:id`, [authMiddleware, hasPermission(Permission.DELETE_ORDER)], this.orderController.deleteOrder);
  }
}
export default OrderRoute;