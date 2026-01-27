import { User } from '@/modules/users/users.interface';
import { Order } from '@/modules/orders/orders.interface';
import { Document, Types, HydratedDocument } from 'mongoose';
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
}
export enum PaymentProvider {
  PAYSTACK = 'paystack',
}
export enum PaymentChannel {
  CARD = 'card',
  BANK = 'bank',
  USSD = 'ussd',
  QR = 'qr',
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
}
export interface PaymentMethod {
  type: PaymentChannel;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  bank?: string;
  accountNumber?: string;
}
export interface PaymentDetails {
  method: PaymentMethod;
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
export interface RefundDetails {
  amount: number;
  reason: string;
  status: PaymentStatus;
  transactionId: string;
  refundedAt: Date;
  processedBy?: string;
  notes?: string;
}
export interface PaymentCustomer {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  metadata?: Record<string, any>;
}
export interface PaymentAmount {
  value: number;
  currency: string;
}
export interface PaymentMetadata {
  orderId?: string;
  productIds?: string[];
  customFields?: Record<string, any>;
}
export interface Payment extends Document {
  _id: Types.ObjectId;
  order: Types.ObjectId | Order;
  user: Types.ObjectId | User;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentDetails: PaymentDetails;
  refunds?: RefundDetails[];
  totalRefundedAmount?: number;
  initiatedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  lastUpdatedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  attempts?: number;
  metadata?: Record<string, any>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  canBeRefunded(): boolean;
  getRemainingRefundableAmount(): number;
  isFullyRefunded(): boolean;
  isPartiallyRefunded(): boolean;
}
export interface PaymentTransactionBase {
  provider: PaymentProvider;
  reference: string;
  amount: PaymentAmount;
  customer: PaymentCustomer;
  metadata?: PaymentMetadata;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  providerFee?: number;
  settlementAmount?: number;
  paymentUrl?: string;
  accessCode?: string;
  gatewayResponse?: string;
  ipAddress?: string;
  currency: string;
  channel?: PaymentChannel;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
export interface PaymentTransaction extends PaymentTransactionBase {
  _id: Types.ObjectId;
}
export interface PaymentRefundBase {
  transactionId: string;
  amount: PaymentAmount;
  reason: string;
  status: PaymentStatus;
  reference: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
export interface PaymentRefund extends PaymentRefundBase {
  _id: Types.ObjectId;
}
export interface PaymentDocument extends HydratedDocument<Payment> {
  canBeRefunded(): boolean;
  getRemainingRefundableAmount(): number;
  isFullyRefunded(): boolean;
  isPartiallyRefunded(): boolean;
}
export type PaymentTransactionDocument = HydratedDocument<PaymentTransaction>;
export type PaymentRefundDocument = HydratedDocument<PaymentRefund>;
export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}
export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    fees: number;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      metadata: any;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      account_name: string;
    };
  };
}
export interface PaystackRefundResponse {
  status: boolean;
  message: string;
  data: {
    transaction: number;
    currency: string;
    amount: number;
    status: string;
    reference: string;
    merchant_note: string;
    customer_note: string;
    created_at: string;
  };
}
export function isPaymentStatus(value: string): value is PaymentStatus {
  return Object.values(PaymentStatus).includes(value as PaymentStatus);
}
export function isPaymentProvider(value: string): value is PaymentProvider {
  return Object.values(PaymentProvider).includes(value as PaymentProvider);
}
export function isPaymentChannel(value: string): value is PaymentChannel {
  return Object.values(PaymentChannel).includes(value as PaymentChannel);
}
export interface PaystackWebhookData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: {
    custom_fields: {
      display_name: string;
      variable_name: string;
      value: string;
    }[];
    referrer: string;
  };
  fees_breakdown: any;
  fees: number;
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
    account_name: string;
    receiver_bank_account_number: string;
    receiver_bank: string;
  };
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    customer_code: string;
    phone: string;
    metadata: any;
    risk_action: string;
    international_format_phone: string;
  };
  plan: any;
  subaccount: any;
  split: any;
  order_id: string;
  paidAt: string;
  requested_amount: number;
  pos_transaction_data: any;
  source: {
    type: string;
    source: string;
    entry_point: string;
    identifier: string;
  };
}
export interface PaystackWebhookEvent {
  event: string;
  data: PaystackWebhookData;
}