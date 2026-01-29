import { Routes } from '../../interfaces/routes.interface';
import PaymentController from '../../modules/payments/payments.controller';
declare class PaymentRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    paymentController: PaymentController;
    constructor();
    private initializeRoutes;
}
export default PaymentRoute;
