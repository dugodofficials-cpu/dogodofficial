import { model, Schema } from 'mongoose';
import { Payment, PaymentTransaction, PaymentRefund, PaymentDocument, PaymentTransactionDocument, PaymentRefundDocument, PaymentStatus, PaymentProvider, PaymentChannel } from './payments.interface';
const paymentMethodSchema = new Schema(
  {
    type: { type: String, enum: Object.values(PaymentChannel), required: true },
    cardNumber: { type: String },
    expiryMonth: { type: String },
    expiryYear: { type: String },
    cvv: { type: String },
    bank: { type: String },
    accountNumber: { type: String },
  },
  { _id: false },
);
const paymentAmountSchema = new Schema(
  {
    value: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  { _id: false },
);
const paymentCustomerSchema = new Schema(
  {
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false },
);
const paymentMetadataSchema = new Schema(
  {
    orderId: { type: String },
    productIds: [{ type: String }],
    customFields: { type: Schema.Types.Mixed },
  },
  { _id: false },
);
const paymentTransactionSchema = new Schema<PaymentTransactionDocument>({
  provider: { type: String, enum: Object.values(PaymentProvider), required: true },
  reference: { type: String, required: true },
  amount: {
    value: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  customer: {
    email: { type: String, required: true },
    firstName: String,
    lastName: String,
    phone: String,
    metadata: Schema.Types.Mixed,
  },
  metadata: Schema.Types.Mixed,
  status: { type: String, enum: Object.values(PaymentStatus), required: true },
  paymentMethod: {
    type: { type: String, enum: Object.values(PaymentChannel), required: true },
    cardNumber: String,
    expiryMonth: String,
    expiryYear: String,
    cvv: String,
    bank: String,
    accountNumber: String,
  },
  providerFee: Number,
  settlementAmount: Number,
  paymentUrl: String,
  accessCode: String,
  gatewayResponse: String,
  ipAddress: String,
  currency: { type: String, required: true },
  channel: { type: String, enum: Object.values(PaymentChannel) },
  paidAt: Date,
}, {
  timestamps: true,
});
const paymentRefundSchema = new Schema<PaymentRefundDocument>({
  transactionId: { type: String, required: true },
  amount: {
    value: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  reason: { type: String, required: true },
  status: { type: String, enum: Object.values(PaymentStatus), required: true },
  reference: { type: String, required: true },
  metadata: Schema.Types.Mixed,
}, {
  timestamps: true,
});
paymentTransactionSchema.index({ reference: 1 }, { unique: true });
paymentTransactionSchema.index({ status: 1 });
paymentTransactionSchema.index({ createdAt: -1 });
paymentTransactionSchema.index({ 'metadata.orderId': 1 });
paymentRefundSchema.index({ reference: 1 }, { unique: true });
paymentRefundSchema.index({ transactionId: 1 });
paymentRefundSchema.index({ status: 1 });
paymentRefundSchema.index({ createdAt: -1 });
const paymentSchema = new Schema<PaymentDocument>({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: Object.values(PaymentStatus), required: true },
  txid: { type: String },
  paymentDetails: {
    method: {
      type: { type: String, enum: Object.values(PaymentChannel), required: true },
      cardNumber: String,
      expiryMonth: String,
      expiryYear: String,
      cvv: String,
      bank: String,
      accountNumber: String,
    },
    provider: { type: String, enum: Object.values(PaymentProvider), required: true },
    transactionId: String,
    cardLast4: String,
    cardBrand: String,
    cardExpiryMonth: String,
    cardExpiryYear: String,
    bankName: String,
    bankAccountLast4: String,
    walletType: String,
    cryptoCurrency: String,
    cryptoAddress: String,
  },
  refunds: [{
    amount: Number,
    reason: String,
    status: { type: String, enum: Object.values(PaymentStatus) },
    transactionId: String,
    refundedAt: Date,
    processedBy: String,
    notes: String,
  }],
  totalRefundedAmount: Number,
  initiatedAt: { type: Date, required: true },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  cancelledAt: Date,
  lastUpdatedAt: Date,
  errorCode: String,
  errorMessage: String,
  attempts: Number,
  metadata: Schema.Types.Mixed,
  notes: String,
}, {
  timestamps: true,
});
paymentSchema.methods.canBeRefunded = function (): boolean {
  return this.status === PaymentStatus.COMPLETED;
};
paymentSchema.methods.getRemainingRefundableAmount = function (): number {
  if (!this.canBeRefunded()) return 0;
  return this.amount - (this.totalRefundedAmount || 0);
};
paymentSchema.methods.isFullyRefunded = function (): boolean {
  return this.status === PaymentStatus.REFUNDED;
};
paymentSchema.methods.isPartiallyRefunded = function (): boolean {
  return this.status === PaymentStatus.PARTIALLY_REFUNDED;
};
export const PaymentModel = model<PaymentDocument>('Payment', paymentSchema);
export const PaymentTransactionModel = model<PaymentTransactionDocument>('PaymentTransaction', paymentTransactionSchema);
export const PaymentRefundModel = model<PaymentRefundDocument>('PaymentRefund', paymentRefundSchema);
export type { PaymentDocument, PaymentTransactionDocument, PaymentRefundDocument };