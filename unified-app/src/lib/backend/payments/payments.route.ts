import { Router } from 'express';
import { Routes } from '@backend/interfaces/routes.interface';
import PaymentController from '@backend/payments/payments.controller';
import authMiddleware from '@backend/middlewares/auth.middleware';
import { Permission } from '@backend/roles/roles.interface';
import { hasPermission } from '@backend/middlewares/permission.middleware';
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

    this.router.get(
      `${this.path}/admin/crypto/processing`,
      authMiddleware,
      hasPermission(Permission.READ_PAYMENT),
      this.paymentController.getProcessingCryptoPayments,
    );

    this.router.patch(
      `${this.path}/admin/crypto/:id/review`,
      authMiddleware,
      hasPermission(Permission.UPDATE_PAYMENT),
      this.paymentController.reviewCryptoPayment,
    );
  }
}

export default PaymentRoute;