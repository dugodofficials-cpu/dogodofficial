import { NextFunction, Request, Response } from 'express';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderStatusDto, UpdateDeliveryStatusDto, GetOrdersQueryDto } from '@/modules/orders/orders.dto';
import { Order, OrderStatistics, OrderStatus } from '@/modules/orders/orders.interface';
import OrderService from '@/modules/orders/orders.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { User } from '../users/users.interface';
import { logger } from '@/utils/logger';
class OrderController {
  public orderService = new OrderService();
  public getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: GetOrdersQueryDto = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string,
        status: req.query.status as OrderStatus,
        userId: req.query.userId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        minTotal: req.query.minTotal ? parseFloat(req.query.minTotal as string) : undefined,
        maxTotal: req.query.maxTotal ? parseFloat(req.query.maxTotal as string) : undefined,
        sortBy: req.query.sortBy as 'orderNumber' | 'total' | 'orderedAt' | 'status',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      const { orders, total, page, limit, totalPages } = await this.orderService.findAllOrders(query);
      res.status(200).json({
        data: orders,
        meta: {
          total,
          page,
          limit,
          totalPages
        },
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };
  public getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId: string = req.params.id;
      const findOneOrderData: Order = await this.orderService.findOrderById(orderId);
      res.status(200).json({ data: findOneOrderData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public getOrderByNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderNumber: string = req.params.orderNumber;
      const findOneOrderData: Order = await this.orderService.findOrderByNumber(orderNumber);
      res.status(200).json({ data: findOneOrderData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public getOrderStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderStatistics: OrderStatistics = await this.orderService.orderStatistics();
      res.status(200).json({ data: orderStatistics, message: 'orderStatistics' });
    } catch (error) {
      next(error);
    }
  };
  public createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderData: CreateOrderDto = req.body;
      const createOrderData: Order = await this.orderService.createOrder(orderData);
      res.status(201).json({ data: createOrderData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId: string = req.params.id;
      const orderData: UpdateOrderDto = req.body;
      const updateOrderData: Order = await this.orderService.updateOrder(orderId, orderData);
      res.status(200).json({ data: updateOrderData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public updateOrderStatus = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId: string = req.params.id;
      const statusData: UpdateOrderStatusDto = req.body;

      logger.info(
        `Order status update requested: orderId=${orderId} newStatus=${statusData.status} userId=${req.user?._id} email=${req.user?.email} ip=${req.ip} ua=${req.get('user-agent')}`,
      );

      const updateOrderData: Order = await this.orderService.updateOrderStatus(orderId, statusData, req.user as User);
      res.status(200).json({ data: updateOrderData, message: 'status updated' });
    } catch (error) {
      next(error);
    }
  };
  public updateDeliveryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId: string = req.params.id;
      const deliveryData: UpdateDeliveryStatusDto = req.body;
      const updateOrderData: Order = await this.orderService.updateDeliveryStatus(orderId, deliveryData);
      res.status(200).json({ data: updateOrderData, message: 'delivery status updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId: string = req.params.id;
      const deleteOrderData: Order = await this.orderService.deleteOrder(orderId);
      res.status(200).json({ data: deleteOrderData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public getUserOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || null;
      const productType = req.query.type as 'PHYSICAL' | 'DIGITAL' | undefined;
      const includeBundleItems = req.query.includeBundleItems === 'true';
      const { orders, total, totalPages } = await this.orderService.getUserOrders(userId, page, limit, productType, includeBundleItems);
      res.status(200).json({
        data: orders,
        meta: {
          total,
          totalPages,
          currentPage: page,
          limit,
          productType: productType || 'ALL'
        },
        message: 'findUserOrders'
      });
    } catch (error) {
      next(error);
    }
  };
  public getOrdersByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status: any = req.params.status;
      const orders: Order[] = await this.orderService.getOrdersByStatus(status);
      res.status(200).json({ data: orders, message: 'findOrdersByStatus' });
    } catch (error) {
      next(error);
    }
  };
  public getOrdersByDateRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startDate: Date = new Date(req.query.startDate as string);
      const endDate: Date = new Date(req.query.endDate as string);
      const orders: Order[] = await this.orderService.getOrdersByDateRange(startDate, endDate);
      res.status(200).json({ data: orders, message: 'findOrdersByDateRange' });
    } catch (error) {
      next(error);
    }
  };
  public resendOrderConfirmation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId: string = req.params.id;
      await this.orderService.resendOrderConfirmation(orderId);
      res.status(200).json({ message: 'Order confirmation resent' });
    } catch (error) {
      next(error);
    }
  };
}
export default OrderController;