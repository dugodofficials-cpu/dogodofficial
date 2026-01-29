import { NextFunction, Request, Response } from 'express';
import PaymentService from '../../modules/payments/payments.service';
declare class PaymentController {
    paymentService: PaymentService;
    getPayments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentByTransactionId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    processRefund: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateRefundStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deletePayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserPayments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentsByStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentsByDateRange: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderPayments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    initiatePayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verifyPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    refundPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTransaction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTransactions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRefund: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRefunds: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    handlePaystackWebhook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default PaymentController;
