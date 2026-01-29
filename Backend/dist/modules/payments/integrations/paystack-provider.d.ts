import { PaymentProvider, PaymentStatus, PaymentTransaction, PaystackInitializeResponse, PaystackVerifyResponse, PaystackRefundResponse } from '../payments.interface';
export default class PaystackPaymentProvider {
    private readonly secretKey;
    private readonly baseUrl;
    constructor(secretKey: string);
    private makeRequest;
    initializePayment(transaction: Partial<PaymentTransaction>): Promise<PaystackInitializeResponse>;
    verifyPayment(reference: string): Promise<PaystackVerifyResponse>;
    refundPayment(transactionId: string, amount?: number): Promise<PaystackRefundResponse>;
    mapPaystackStatus(paystackStatus: string): PaymentStatus;
    private getSupportedChannels;
    getProvider(): PaymentProvider;
}
