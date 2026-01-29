import { PaymentStatus, PaymentProvider, PaymentChannel } from './payments.interface';
export declare class PaymentDetailsDto {
    method: PaymentChannel;
    provider: PaymentProvider;
    transactionId?: string;
    cardLast4?: string;
    cardBrand?: string;
    cardExpiryMonth?: string;
    cardExpiryYear?: string;
    bankName?: string;
    bankAccountLast4?: string;
    walletType?: string;
    cryptoCurrency?: string;
    cryptoAddress?: string;
}
export declare class RefundDetailsDto {
    amount: number;
    reason: string;
    status: PaymentStatus;
    transactionId: string;
    refundedAt: Date;
    processedBy?: string;
    notes?: string;
}
export declare class CreatePaymentDto {
    order: string;
    user: string;
    amount: number;
    currency: string;
    status?: PaymentStatus;
    paymentDetails: PaymentDetailsDto;
    metadata?: Record<string, any>;
    notes?: string;
}
export declare class UpdatePaymentDto {
    status?: PaymentStatus;
    paymentDetails?: PaymentDetailsDto;
    errorCode?: string;
    errorMessage?: string;
    attempts?: number;
    metadata?: Record<string, any>;
    notes?: string;
}
export declare class CreateRefundDto {
    amount: number;
    reason: string;
    processedBy?: string;
    notes?: string;
}
export declare class UpdateRefundStatusDto {
    status: PaymentStatus;
    transactionId: string;
    notes?: string;
}
export declare class PaymentCustomerDto {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    metadata?: Record<string, any>;
}
export declare class PaymentAmountDto {
    value: number;
    currency: string;
}
export declare class PaymentMethodDto {
    type: PaymentChannel;
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    bank?: string;
    accountNumber?: string;
}
export declare class InitiatePaymentDto {
    amount: number;
    currency: string;
    email: string;
    firstName?: string;
    lastName?: string;
    provider: PaymentProvider;
    paymentMethod: PaymentMethodDto;
    metadata?: Record<string, any>;
}
export declare class UpdatePaymentStatusDto {
    status: PaymentStatus;
    errorCode?: string;
    errorMessage?: string;
    processedAt?: Date;
}
export declare class RefundPaymentDto {
    amount: number;
    reason: string;
    status?: PaymentStatus;
    notes?: string;
}
export declare class PaymentFilterDto {
    userId?: string;
    orderId?: string;
    status?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    currency?: string;
}
export declare class PaymentWebhookDto {
    event: string;
    reference: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    gatewayResponse?: string;
    ipAddress?: string;
    customer?: Record<string, any>;
    authorization?: Record<string, any>;
    metadata?: Record<string, any>;
}
export declare class PaymentMethodConfigDto {
    type: PaymentChannel;
    enabled: boolean;
    config?: Record<string, any>;
}
export declare class PaymentProviderConfigDto {
    provider: PaymentProvider;
    enabled: boolean;
    secretKey: string;
    publicKey: string;
    webhookSecret?: string;
    supportedMethods: PaymentMethodConfigDto[];
}
