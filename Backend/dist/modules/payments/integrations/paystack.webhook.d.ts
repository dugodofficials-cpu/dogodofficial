/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from 'express';
import { PaystackWebhookData } from '../../../modules/payments/payments.interface';
export declare class PaystackWebhookHandler {
    private readonly webhookSecret;
    private readonly paymentService;
    private readonly orderService;
    private readonly cartService;
    private readonly userService;
    constructor();
    private verifySignature;
    handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
    handleSupportedMovement(data: PaystackWebhookData): Promise<void>;
    private handleSuccessfulCharge;
}
export declare const paystackWebhookHandler: PaystackWebhookHandler;
