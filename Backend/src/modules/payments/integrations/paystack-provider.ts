import { PaymentProvider, PaymentStatus, PaymentTransaction, PaystackInitializeResponse, PaystackVerifyResponse, PaystackRefundResponse, PaymentChannel } from '../payments.interface';
import axios, { AxiosError } from 'axios';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
export default class PaystackPaymentProvider {
  private readonly secretKey: string;
  private readonly baseUrl: string = 'https://api.paystack.co';
  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error('Paystack secret key is required');
    }
    this.secretKey = secretKey;
  }
  private async makeRequest<T>(method: string, endpoint: string, data?: any): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.message;
        logger.error(`Paystack API Error: ${errorMessage}`, {
          endpoint,
          statusCode: error.response?.status,
          errorData: error.response?.data,
        });
        throw new HttpException(error.response?.status || 500, `Payment provider error: ${errorMessage}`);
      }
      logger.error('Unexpected error during Paystack API call:', error);
      throw new HttpException(500, 'Unexpected error during payment processing');
    }
  }
  public async initializePayment(transaction: Partial<PaymentTransaction>): Promise<PaystackInitializeResponse> {
    if (!transaction.amount?.value || !transaction.customer?.email) {
      throw new HttpException(400, 'Amount and customer email are required');
    }
    const payload = {
      amount: Math.round(transaction.amount.value * 100),
      email: transaction.customer.email,
      reference: transaction.reference,
      callback_url: process.env.PAYSTACK_CALLBACK_URL,
      metadata: {
        ...transaction.metadata,
        custom_fields: [
          {
            display_name: 'Payment For',
            variable_name: 'payment_for',
            value: transaction.metadata?.orderId || 'Product Purchase',
          },
        ],
      },
      channels: this.getSupportedChannels(),
    };
    return this.makeRequest<PaystackInitializeResponse>('POST', '/transaction/initialize', payload);
  }
  public async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    if (!reference) {
      throw new HttpException(400, 'Payment reference is required');
    }
    return this.makeRequest<PaystackVerifyResponse>('GET', `/transaction/verify/${encodeURIComponent(reference)}`);
  }
  public async refundPayment(transactionId: string, amount?: number): Promise<PaystackRefundResponse> {
    if (!transactionId) {
      throw new HttpException(400, 'Transaction ID is required');
    }
    const payload: Record<string, any> = {
      transaction: transactionId,
    };
    if (amount) {
      payload.amount = Math.round(amount * 100);
    }
    return this.makeRequest<PaystackRefundResponse>('POST', '/refund', payload);
  }
  public mapPaystackStatus(paystackStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      pending: PaymentStatus.PENDING,
      success: PaymentStatus.COMPLETED,
      failed: PaymentStatus.FAILED,
      abandoned: PaymentStatus.CANCELLED,
    };
    return statusMap[paystackStatus.toLowerCase()] || PaymentStatus.FAILED;
  }
  private getSupportedChannels(): PaymentChannel[] {
    return [
      PaymentChannel.CARD,
      PaymentChannel.BANK,
      PaymentChannel.USSD,
      PaymentChannel.QR,
      PaymentChannel.MOBILE_MONEY,
      PaymentChannel.BANK_TRANSFER,
    ];
  }
  public getProvider(): PaymentProvider {
    return PaymentProvider.PAYSTACK;
  }
}