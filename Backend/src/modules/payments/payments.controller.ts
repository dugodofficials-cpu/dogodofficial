import { NextFunction, Request, Response } from 'express';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  CreateRefundDto,
  UpdateRefundStatusDto,
  InitiatePaymentDto,
  RefundPaymentDto,
} from '@/modules/payments/payments.dto';
import { Payment, PaymentChannel, PaymentProvider, PaymentStatus } from '@/modules/payments/payments.interface';
import PaymentService from '@/modules/payments/payments.service';
import { paystackWebhookHandler } from './integrations/paystack.webhook';
import orderModel from '@/modules/orders/orders.model';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
class PaymentController {
  public paymentService = new PaymentService();
  public getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllPaymentsData: Payment[] = await this.paymentService.findAllPayments();
      res.status(200).json({ data: findAllPaymentsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getPaymentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentId: string = req.params.id;
      const findOnePaymentData: Payment = await this.paymentService.findPaymentById(paymentId);
      res.status(200).json({ data: findOnePaymentData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public getPaymentByTransactionId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactionId: string = req.params.transactionId;
      const findOnePaymentData: Payment = await this.paymentService.findPaymentByTransactionId(transactionId);
      res.status(200).json({ data: findOnePaymentData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public createPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentData: CreatePaymentDto = req.body;
      const createPaymentData: Payment = await this.paymentService.createPayment(paymentData);
      res.status(201).json({ data: createPaymentData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updatePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentId: string = req.params.id;
      const paymentData: UpdatePaymentDto = req.body;
      const updatePaymentData: Payment = await this.paymentService.updatePayment(paymentId, paymentData);
      res.status(200).json({ data: updatePaymentData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public processRefund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentId: string = req.params.id;
      const refundData: CreateRefundDto = req.body;
      const updatePaymentData: Payment = await this.paymentService.processRefund(paymentId, refundData);
      res.status(200).json({ data: updatePaymentData, message: 'refund processed' });
    } catch (error) {
      next(error);
    }
  };
  public updateRefundStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentId: string = req.params.id;
      const refundId: string = req.params.refundId;
      const statusData: UpdateRefundStatusDto = req.body;
      const updatePaymentData: Payment = await this.paymentService.updateRefundStatus(paymentId, refundId, statusData);
      res.status(200).json({ data: updatePaymentData, message: 'refund status updated' });
    } catch (error) {
      next(error);
    }
  };
  public deletePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentId: string = req.params.id;
      const deletePaymentData: Payment = await this.paymentService.deletePayment(paymentId);
      res.status(200).json({ data: deletePaymentData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public getUserPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId: string = req.params.userId;
      const payments: Payment[] = await this.paymentService.getPayments({ userId });
      res.status(200).json({ data: payments, message: 'findUserPayments' });
    } catch (error) {
      next(error);
    }
  };
  public getPaymentsByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.params.status as PaymentStatus;
      const payments: Payment[] = await this.paymentService.getPayments({ status });
      res.status(200).json({ data: payments, message: 'findPaymentsByStatus' });
    } catch (error) {
      next(error);
    }
  };
  public getPaymentsByDateRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startDate: Date = new Date(req.query.startDate as string);
      const endDate: Date = new Date(req.query.endDate as string);
      const payments: Payment[] = await this.paymentService.getPayments({ startDate, endDate });
      res.status(200).json({ data: payments, message: 'findPaymentsByDateRange' });
    } catch (error) {
      next(error);
    }
  };
  public getOrderPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId: string = req.params.orderId;
      const payments: Payment[] = await this.paymentService.getPayments({ orderId });
      res.status(200).json({ data: payments, message: 'findOrderPayments' });
    } catch (error) {
      next(error);
    }
  };
  public initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentData: InitiatePaymentDto = req.body;
      const payment = await this.paymentService.initiatePayment(paymentData);
      res.status(201).json({ data: payment, message: 'Payment initiated successfully' });
    } catch (error) {
      next(error);
    }
  };
  public verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reference = String(req.params.reference);
      const payment = await this.paymentService.verifyPayment(reference);
      res.status(200).json({ data: payment, message: 'Payment verified successfully' });
    } catch (error) {
      next(error);
    }
  };
  public refundPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactionId = String(req.params.transactionId);
      const refundData: RefundPaymentDto = req.body;
      const refund = await this.paymentService.refundPayment(transactionId, refundData);
      res.status(200).json({ data: refund, message: 'Refund initiated successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactionId = String(req.params.transactionId);
      const transaction = await this.paymentService.getTransaction(transactionId);
      res.status(200).json({ data: transaction, message: 'Transaction retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = req.query;
      const transactions = await this.paymentService.getTransactions(filters);
      res.status(200).json({ data: transactions, message: 'Transactions retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getRefund = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refundId = String(req.params.refundId);
      const refund = await this.paymentService.getRefund(refundId);
      res.status(200).json({ data: refund, message: 'Refund retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
  public getRefunds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = req.query;
      const refunds = await this.paymentService.getRefunds(filters);
      res.status(200).json({ data: refunds, message: 'Refunds retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
  public submitCryptoHash = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentId: string = req.params.id;
      const { txid }: { txid: string } = req.body;
      const updatePaymentData: Payment = await this.paymentService.submitCryptoHash(paymentId, txid);
      res.status(200).json({ data: updatePaymentData, message: 'hashSubmitted' });
    } catch (error) {
      next(error);
    }
  };
  public submitCryptoHashByOrder = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId, txid }: { orderId: string; txid: string } = req.body;
      const payments = await this.paymentService.getPayments({ orderId });
      
      let payment = payments.find(p => p.paymentDetails.provider === PaymentProvider.CRYPTO);
      
      if (!payment) {
        // Create a new crypto payment record if it doesn't exist
        const order = await orderModel.findById(orderId);
        if (!order) throw new HttpException(404, 'Order not found');
        if (!req.user?._id) throw new HttpException(401, 'Authentication token missing');
        
        payment = await this.paymentService.createPayment({
          order: orderId,
          user: req.user._id.toString(),
          amount: order.total,
          currency: 'NGN',
          status: PaymentStatus.PENDING,
          paymentDetails: {
            method: PaymentChannel.CRYPTO,
            provider: PaymentProvider.CRYPTO,
          }
        });
      }

      const updatePaymentData: Payment = await this.paymentService.submitCryptoHash(payment._id.toString(), txid);
      res.status(200).json({ data: updatePaymentData, message: 'hashSubmitted' });
    } catch (error) {
      next(error);
    }
  };
  public handlePaystackWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await paystackWebhookHandler.handleWebhook(req, res, next);
  };
}
export default PaymentController;