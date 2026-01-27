import { model, Schema, Document } from 'mongoose';
import { Order, OrderStatus, DeliveryStatus } from '@/modules/orders/orders.interface';
const shippingDetailsSchema = new Schema(
  {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    trackingNumber: String,
    carrier: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    deliveryStatus: {
      type: String,
      enum: Object.values(DeliveryStatus),
      default: DeliveryStatus.PENDING,
    },
    deliveryNotes: String,
  },
  { _id: false },
);
const digitalDeliveryDetailsSchema = new Schema(
  {
    email: { type: String, required: true },
    downloadLinks: [{ type: String }],
    accessKeys: [{ type: String }],
    expiryDate: Date,
    downloadCount: { type: Number, default: 0 },
  },
  { _id: false },
);
const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    selectedOptions: {
      type: [String],
      required: false,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);
const orderSchema: Schema = new Schema(
  {
    cartId: {
      type: Schema.Types.ObjectId,
      ref: 'Cart',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        {
          validator: function (items: any[]) {
            return items.length > 0;
          },
          message: 'Order must contain at least one item',
        },
      ],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      required: true,
      ref: 'Payment',
    },
    shippingDetails: {
      type: shippingDetailsSchema,
      required: function () {
        return this.items.some((item: any) => item.product.type === 'PHYSICAL');
      },
    },
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    notes: String,
    isGift: {
      type: Boolean,
      default: false,
    },
    giftMessage: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderedAt: -1 });
orderSchema.index({ 'shippingDetails.deliveryStatus': 1 });
orderSchema.virtual('orderAge').get(function () {
  return Math.floor((Date.now() - this.orderedAt.getTime()) / (1000 * 60 * 60 * 24));
});
orderSchema.pre('validate', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});
const orderModel = model<Order & Document>('Order', orderSchema);
export default orderModel;