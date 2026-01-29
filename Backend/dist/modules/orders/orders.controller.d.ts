import { NextFunction, Request, Response } from 'express';
import OrderService from '../../modules/orders/orders.service';
import { RequestWithUser } from '../../interfaces/auth.interface';
declare class OrderController {
    orderService: OrderService;
    getOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderByNumber: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderStatistics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateOrderStatus: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    updateDeliveryStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrdersByStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrdersByDateRange: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resendOrderConfirmation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default OrderController;
