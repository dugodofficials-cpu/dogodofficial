import { Order } from '@/modules/orders/orders.interface';
import OrderModel from '@/modules/orders/orders.model';
import {
  CreatePaymentDto,
  CreateRefundDto,
  InitiatePaymentDto,
  RefundPaymentDto,
  UpdatePaymentDto,
  UpdateRefundStatusDto,
} from '@/modules/payments/payments.dto';
import {
  Payment,
  PaymentRefund,
  PaymentStatus,
  PaymentTransaction,
  PaymentProvider,
  PaymentMethod,
  PaymentChannel,
  PaymentTransactionBase,
  PaymentRefundBase,
  isPaymentStatus,
  isPaymentChannel,
  PaymentAmount,
  PaymentDocument,
} from '@/modules/payments/payments.interface';
import { PaymentModel, PaymentRefundModel, PaymentTransactionModel, PaymentTransactionDocument, PaymentRefundDocument } from '@/modules/payments/payments.model';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { v4 as uuidv4 } from 'uuid';
import PaystackProvider from './integrations/paystack-provider';
import cryptoProvider from './integrations/crypto-provider';
import OrderService from '@/modules/orders/orders.service';
import { OrderStatus } from '@/modules/orders/orders.interface';
import { User } from '@/modules/users/users.interface';

export class PaymentService {
  private payments = PaymentModel;
  private transactions = PaymentTransactionModel;
  private refunds = PaymentRefundModel;
  private paystackProvider: PaystackProvider;
  private orderService: OrderService;
  constructor() {
    this.paystackProvider = new PaystackProvider(process.env.PAYSTACK_SECRET_KEY);
    this.orderService = new OrderService();
  }
  public async findAllPayments(): Promise<Payment[]> {
    const payments: Payment[] = await this.payments.find().populate('user').populate('order');
    return payments;
  }

  public async findProcessingCryptoPayments(): Promise<Payment[]> {
    return this.payments
      .find({ status: PaymentStatus.PROCESSING, 'paymentDetails.provider': PaymentProvider.CRYPTO })
      .populate('user')
      .populate('order')
      .sort({ initiatedAt: -1 });
  }

  public async reviewCryptoPayment(params: {
    paymentId: string;
    status: PaymentStatus.COMPLETED | PaymentStatus.FAILED;
    adminUser: User;
    notes?: string;
  }): Promise<Payment> {
    const { paymentId, status, adminUser, notes } = params;
    const payment = await this.findPaymentById(paymentId);

    if (payment.paymentDetails?.provider !== PaymentProvider.CRYPTO) {
      throw new HttpException(400, 'Payment is not a crypto payment');
    }

    if (payment.status !== PaymentStatus.PROCESSING) {
      throw new HttpException(400, `Only processing crypto payments can be reviewed. Current status: ${payment.status}`);
    }

    const updatedPayment = await this.updatePayment(paymentId, {
      status,
      notes: notes ?? payment.notes,
      metadata: {
        ...payment.metadata,
        cryptoReview: {
          reviewedAt: new Date(),
          reviewedBy: adminUser?._id,
          reviewedByEmail: adminUser?.email,
          status,
        },
      },
    });

    if (updatedPayment.order && status === PaymentStatus.COMPLETED) {
      await this.orderService.updateOrderStatus(
        updatedPayment.order._id.toString(),
        {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.COMPLETED,
          notes: `Crypto payment approved. TXID: ${updatedPayment.txid || updatedPayment.paymentDetails?.transactionId || ''}`,
        } as any,
        adminUser,
      );
    }

    return updatedPayment;
  }
  public async findPaymentById(paymentId: string): Promise<Payment> {
    if (isEmpty(paymentId)) throw new HttpException(400, 'PaymentId is empty');
    const findPayment: Payment = await this.payments.findOne({ _id: paymentId }).populate('user').populate('order');
    if (!findPayment) throw new HttpException(409, "Payment doesn't exist");
    return findPayment;
  }
  public async findPaymentByTransactionId(transactionId: string): Promise<Payment> {
    if (isEmpty(transactionId)) throw new HttpException(400, 'TransactionId is empty');
    const findPayment: Payment = await this.payments.findOne({ 'paymentDetails.transactionId': transactionId }).populate('user').populate('order');
    if (!findPayment) throw new HttpException(409, "Payment doesn't exist");
    return findPayment;
  }
  public async createPayment(paymentData: CreatePaymentDto): Promise<Payment> {
    if (isEmpty(paymentData)) throw new HttpException(400, 'paymentData is empty');
    const order: Order = await OrderModel.findById(paymentData.order);
    if (!order) {
      throw new HttpException(404, `Order ${paymentData.order} not found`);
    }
    if (order.total !== paymentData.amount) {
      throw new HttpException(400, `Payment amount ${paymentData.amount} does not match order total ${order.total}`);
    }
    const createPaymentData: Payment = await this.payments.create({
      ...paymentData,
      status: PaymentStatus.PENDING,
      initiatedAt: new Date(),
    });
    return createPaymentData;
  }
  public async updatePayment(paymentId: string, paymentData: UpdatePaymentDto): Promise<Payment> {
    if (isEmpty(paymentData)) throw new HttpException(400, 'paymentData is empty');
    const payment = await this.findPaymentById(paymentId);
    if (paymentData.status) {
      if (!isPaymentStatus(paymentData.status)) {
        throw new HttpException(400, 'Invalid payment status');
      }
      const invalidTransitions: Record<PaymentStatus, PaymentStatus[]> = {
        [PaymentStatus.COMPLETED]: [PaymentStatus.PENDING, PaymentStatus.PROCESSING],
        [PaymentStatus.REFUNDED]: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.FAILED, PaymentStatus.CANCELLED],
        [PaymentStatus.PARTIALLY_REFUNDED]: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.FAILED, PaymentStatus.CANCELLED],
        [PaymentStatus.FAILED]: [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
        [PaymentStatus.CANCELLED]: [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
        [PaymentStatus.PENDING]: [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
        [PaymentStatus.PROCESSING]: [PaymentStatus.COMPLETED, PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
      };
      if (invalidTransitions[payment.status]?.includes(paymentData.status)) {
        throw new HttpException(400, `Invalid status transition from ${payment.status} to ${paymentData.status}`);
      }
    }
    const updateData: any = { ...paymentData };
    if (paymentData.status) {
      switch (paymentData.status) {
        case PaymentStatus.PROCESSING:
          updateData.processedAt = new Date();
          break;
        case PaymentStatus.COMPLETED:
          updateData.completedAt = new Date();
          break;
        case PaymentStatus.FAILED:
          updateData.failedAt = new Date();
          break;
        case PaymentStatus.CANCELLED:
          updateData.cancelledAt = new Date();
          break;
        case PaymentStatus.REFUNDED:
        case PaymentStatus.PARTIALLY_REFUNDED:
          break;
      }
      updateData.lastUpdatedAt = new Date();
    }
    const updatePaymentById: Payment = await this.payments
      .findByIdAndUpdate(paymentId, { $set: updateData }, { new: true })
      .populate('user')
      .populate('order');
    return updatePaymentById;
  }
  public async processRefund(paymentId: string, refundData: CreateRefundDto): Promise<Payment> {
    const payment = await this.findPaymentById(paymentId);
    if (!payment.canBeRefunded()) {
      throw new HttpException(400, `Payment cannot be refunded in status ${payment.status}`);
    }
    const remainingRefundableAmount = payment.getRemainingRefundableAmount();
    if (refundData.amount <= 0) {
      throw new HttpException(400, 'Refund amount must be greater than 0');
    }
    if (refundData.amount > remainingRefundableAmount) {
      throw new HttpException(400, `Refund amount ${refundData.amount} exceeds remaining refundable amount ${remainingRefundableAmount}`);
    }
    const totalRefundedAmount = (payment.totalRefundedAmount || 0) + refundData.amount;
    const refund = {
      ...refundData,
      status: PaymentStatus.PROCESSING,
      transactionId: `REF-${Date.now()}-${uuidv4()}`,
      refundedAt: new Date(),
    };
    const updatePaymentById: Payment = await this.payments
      .findByIdAndUpdate(
        paymentId,
        {
          $push: { refunds: refund },
          $set: {
            status: totalRefundedAmount === payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
            totalRefundedAmount,
            lastUpdatedAt: new Date(),
          },
        },
        { new: true },
      )
      .populate('user')
      .populate('order');
    return updatePaymentById;
  }
  public async updateRefundStatus(paymentId: string, refundId: string, statusData: UpdateRefundStatusDto): Promise<Payment> {
    const payment = await this.findPaymentById(paymentId);
    const refundIndex = payment.refunds.findIndex(r => r.transactionId === refundId);
    if (refundIndex === -1) {
      throw new HttpException(404, 'Refund not found');
    }
    const updateQuery = {
      [`refunds.${refundIndex}.status`]: statusData.status,
      [`refunds.${refundIndex}.notes`]: statusData.notes,
    };
    const updatePaymentById: Payment = await this.payments
      .findByIdAndUpdate(paymentId, { $set: updateQuery }, { new: true })
      .populate('user')
      .populate('order');
    return updatePaymentById;
  }
  public async submitCryptoHash(paymentId: string, txid: string): Promise<Payment> {
    if (isEmpty(txid)) throw new HttpException(400, 'Transaction hash is required');
    
    const payment = await this.findPaymentById(paymentId);
    if (payment.paymentDetails.provider !== PaymentProvider.CRYPTO) {
      throw new HttpException(400, 'Payment is not a crypto payment');
    }

    const updatedPayment = await this.payments.findByIdAndUpdate(
      paymentId,
      { 
        $set: { 
          txid, 
          status: PaymentStatus.PROCESSING,
          'paymentDetails.transactionId': txid
        } 
      },
      { new: true }
    ).populate('user').populate('order');

    // Trigger async validation
    this.validateCryptoPayment(paymentId, txid).catch(err => 
      console.error(`Async crypto validation failed for ${paymentId}:`, err)
    );

    return updatedPayment;
  }

  private async validateCryptoPayment(paymentId: string, txid: string): Promise<void> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) return;

    const expectedAddress = payment.paymentDetails?.cryptoAddress || process.env.CRYPTO_WALLET_ADDRESS;
    const expectedAmount = payment.amount;

    const chain = typeof payment.metadata?.chain === 'string' ? payment.metadata.chain : payment.paymentDetails?.walletType;
    const coin = typeof payment.metadata?.coin === 'string' ? payment.metadata.coin : payment.paymentDetails?.cryptoCurrency;

    await this.payments.findByIdAndUpdate(paymentId, {
      $set: {
        status: PaymentStatus.PROCESSING,
        metadata: {
          ...payment.metadata,
          blockchainDetails: {
            note: 'Crypto payments require manual verification. TXID has been received and queued for review.',
            txid,
            chain,
            coin,
            expectedAddress,
            expectedAmount,
            currency: payment.currency,
          },
        },
      },
    });
  }

  public async deletePayment(paymentId: string): Promise<Payment> {
    const payment = await this.findPaymentById(paymentId);
    if (![PaymentStatus.FAILED, PaymentStatus.CANCELLED].includes(payment.status)) {
      throw new HttpException(400, 'Only failed or cancelled payments can be deleted');
    }
    const deletePaymentById: Payment = await this.payments.findByIdAndDelete(paymentId);
    return deletePaymentById;
  }
  public async getPayments(filters: {
    userId?: string;
    orderId?: string;
    status?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    currency?: string;
  } = {}): Promise<PaymentDocument[]> {
    const query: any = {};
    if (filters.userId) query.user = filters.userId;
    if (filters.orderId) query.order = filters.orderId;
    if (filters.status) query.status = filters.status;
    if (filters.currency) query.currency = filters.currency;
    if (filters.startDate || filters.endDate) {
      query.initiatedAt = {};
      if (filters.startDate) query.initiatedAt.$gte = filters.startDate;
      if (filters.endDate) query.initiatedAt.$lte = filters.endDate;
    }
    if (filters.minAmount || filters.maxAmount) {
      query.amount = {};
      if (filters.minAmount) query.amount.$gte = filters.minAmount;
      if (filters.maxAmount) query.amount.$lte = filters.maxAmount;
    }
    return this.payments
      .find(query)
      .populate('user')
      .populate('order')
      .sort({ initiatedAt: -1 });
  }
  private convertPaymentMethodDtoToMethod(dto: InitiatePaymentDto['paymentMethod']): PaymentMethod | undefined {
    if (!dto) return undefined;
    if (!isPaymentChannel(dto.type)) {
      throw new HttpException(400, 'Invalid payment channel');
    }
    return {
      type: dto.type,
      cardNumber: dto.cardNumber,
      expiryMonth: dto.expiryMonth,
      expiryYear: dto.expiryYear,
      cvv: dto.cvv,
      bank: dto.bank,
      accountNumber: dto.accountNumber,
    };
  }
  public async initiatePayment(paymentData: InitiatePaymentDto): Promise<PaymentDocument> {
    const transaction: Partial<PaymentTransaction> = {
      amount: {
        value: paymentData.amount,
        currency: paymentData.currency,
      } as PaymentAmount,
      customer: {
        email: paymentData.email,
        firstName: paymentData.firstName,
        lastName: paymentData.lastName,
      },
      metadata: paymentData.metadata,
      status: PaymentStatus.PENDING,
      paymentMethod: this.convertPaymentMethodDtoToMethod(paymentData.paymentMethod),
      currency: paymentData.currency,
      reference: `PAY-${Date.now()}-${uuidv4()}`,
      provider: PaymentProvider.PAYSTACK,
    };
    const paystackResponse = await this.paystackProvider.initializePayment(transaction);
    const payment = await this.payments.create({
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: PaymentStatus.PENDING,
      paymentDetails: {
        method: paymentData.paymentMethod,
        provider: paymentData.provider
      },
      initiatedAt: new Date(),
      metadata: {
        paymentUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        ...paymentData.metadata
      }
    });
    return payment;
  }
  public async verifyPayment(reference: string): Promise<PaymentTransaction> {
    if (isEmpty(reference)) throw new HttpException(400, 'Reference is empty');
    const transaction = await PaymentTransactionModel.findOne({ reference });
    if (!transaction) throw new HttpException(404, 'Transaction not found');
    const verificationResponse = await this.paystackProvider.verifyPayment(reference);
    const paystackStatus = this.paystackProvider.mapPaystackStatus(verificationResponse.data.status);
    if (!isPaymentStatus(paystackStatus)) {
      throw new HttpException(500, 'Invalid payment status from provider');
    }
    transaction.status = paystackStatus;
    transaction.gatewayResponse = verificationResponse.data.gateway_response;
    const channel = verificationResponse.data.channel;
    if (!isPaymentChannel(channel)) {
      throw new HttpException(500, 'Invalid payment channel from provider');
    }
    transaction.channel = channel;
    transaction.paidAt = verificationResponse.data.paid_at ? new Date(verificationResponse.data.paid_at) : undefined;
    transaction.providerFee = verificationResponse.data.fees / 100;
    transaction.settlementAmount = (verificationResponse.data.amount - verificationResponse.data.fees) / 100;
    transaction.ipAddress = verificationResponse.data.ip_address;
    transaction.updatedAt = new Date();
    await transaction.save();
    return transaction.toObject();
  }
  public async refundPayment(paymentId: string, refundData: RefundPaymentDto): Promise<PaymentRefund> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) {
      throw new HttpException(404, 'Payment not found');
    }
    if (!payment.canBeRefunded()) {
      throw new HttpException(400, 'Payment cannot be refunded');
    }
    const remainingRefundableAmount = payment.getRemainingRefundableAmount();
    if (refundData.amount > remainingRefundableAmount) {
      throw new HttpException(400, 'Refund amount exceeds refundable amount');
    }
    const refundResponse = await this.paystackProvider.refundPayment(payment.paymentDetails.transactionId, refundData.amount);
    const refund = await this.refunds.create({
      amount: {
        value: refundData.amount,
        currency: payment.currency
      } as PaymentAmount,
      reason: refundData.reason,
      status: PaymentStatus.PROCESSING,
      reference: refundResponse.data.reference
    });
    if (refundData.amount === payment.amount) {
      await payment.updateOne({
        status: PaymentStatus.REFUNDED,
        totalRefundedAmount: payment.amount,
        $push: { refunds: refund }
      });
    } else {
      await payment.updateOne({
        status: PaymentStatus.PARTIALLY_REFUNDED,
        totalRefundedAmount: (payment.totalRefundedAmount || 0) + refundData.amount,
        $push: { refunds: refund }
      });
    }
    return refund;
  }
  public async getTransaction(transactionId: string): Promise<PaymentTransaction> {
    if (isEmpty(transactionId)) throw new HttpException(400, 'TransactionId is empty');
    const findTransaction = await PaymentTransactionModel.findById(transactionId);
    if (!findTransaction) throw new HttpException(404, "Transaction doesn't exist");
    return findTransaction.toObject();
  }
  public async getTransactions(filters: Partial<PaymentTransaction> = {}): Promise<PaymentTransaction[]> {
    const transactions = await PaymentTransactionModel.find(filters).sort({ createdAt: -1 });
    return transactions.map(t => t.toObject());
  }
  public async getRefund(refundId: string): Promise<PaymentRefund> {
    if (isEmpty(refundId)) throw new HttpException(400, 'RefundId is empty');
    const findRefund = await PaymentRefundModel.findById(refundId);
    if (!findRefund) throw new HttpException(404, "Refund doesn't exist");
    return findRefund.toObject();
  }
  public async getRefunds(filters: Partial<PaymentRefund> = {}): Promise<PaymentRefund[]> {
    const refunds = await PaymentRefundModel.find(filters).sort({ createdAt: -1 });
    return refunds.map(r => r.toObject());
  }
}
export default PaymentService;