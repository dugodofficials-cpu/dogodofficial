import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import PaymentController from '@/modules/payments/payments.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import { InitiatePaymentDto, RefundPaymentDto } from '@/modules/payments/payments.dto';
import { Permission } from '@/modules/roles/roles.interface';
import { hasPermission } from '@/middlewares/permission.middleware';
class PaymentRoute implements Routes {
  public path = '/payments';
  public router = Router();
  public paymentController = new PaymentController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(`${this.path}/webhook/paystack`, this.paymentController.handlePaystackWebhook);
    this.router.post(`${this.path}/:id/submit-crypto-hash`, authMiddleware, this.paymentController.submitCryptoHash);
    this.router.post(`${this.path}/submit-crypto-hash-by-order`, authMiddleware, this.paymentController.submitCryptoHashByOrder);
  }
}
export default PaymentRoute;