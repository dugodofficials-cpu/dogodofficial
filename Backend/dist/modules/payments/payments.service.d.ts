import { CreatePaymentDto, CreateRefundDto, InitiatePaymentDto, RefundPaymentDto, UpdatePaymentDto, UpdateRefundStatusDto } from '../../modules/payments/payments.dto';
import { Payment, PaymentRefund, PaymentStatus, PaymentTransaction, PaymentDocument } from '../../modules/payments/payments.interface';
export declare class PaymentService {
    private payments;
    private transactions;
    private refunds;
    private paystackProvider;
    constructor();
    findAllPayments(): Promise<Payment[]>;
    findPaymentById(paymentId: string): Promise<Payment>;
    findPaymentByTransactionId(transactionId: string): Promise<Payment>;
    createPayment(paymentData: CreatePaymentDto): Promise<Payment>;
    updatePayment(paymentId: string, paymentData: UpdatePaymentDto): Promise<Payment>;
    processRefund(paymentId: string, refundData: CreateRefundDto): Promise<Payment>;
    updateRefundStatus(paymentId: string, refundId: string, statusData: UpdateRefundStatusDto): Promise<Payment>;
    deletePayment(paymentId: string): Promise<Payment>;
    getPayments(filters?: {
        userId?: string;
        orderId?: string;
        status?: PaymentStatus;
        startDate?: Date;
        endDate?: Date;
        minAmount?: number;
        maxAmount?: number;
        currency?: string;
    }): Promise<PaymentDocument[]>;
    private convertPaymentMethodDtoToMethod;
    initiatePayment(paymentData: InitiatePaymentDto): Promise<PaymentDocument>;
    verifyPayment(reference: string): Promise<PaymentTransaction>;
    refundPayment(paymentId: string, refundData: RefundPaymentDto): Promise<PaymentRefund>;
    getTransaction(transactionId: string): Promise<PaymentTransaction>;
    getTransactions(filters?: Partial<PaymentTransaction>): Promise<PaymentTransaction[]>;
    getRefund(refundId: string): Promise<PaymentRefund>;
    getRefunds(filters?: Partial<PaymentRefund>): Promise<PaymentRefund[]>;
}
export default PaymentService;
