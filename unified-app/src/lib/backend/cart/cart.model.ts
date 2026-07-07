import { model, Schema, Document } from 'mongoose';
import { Cart, CartStatus, DiscountType, CartItem } from '@backend/cart/cart.interface';
import { ProductType } from '@backend/products/products.interface';
const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
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
    selectedOptions: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    notes: String,
    addedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    updatedAt: Date,
  },
  { _id: false },
);
const appliedDiscountSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: Date,
    minimumPurchase: Number,
    maximumDiscount: Number,
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  { _id: false },
);
const shippingEstimateSchema = new Schema(
  {
    provider: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDays: {
      type: Number,
      required: true,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    restrictions: [String],
  },
  { _id: false },
);
const cartSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
      validate: [
        {
          validator: function (items: any[]) {
            return items.length <= 50;
          },
          message: 'Cart cannot contain more than 50 items',
        },
      ],
    },
    itemCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discounts: {
      type: [appliedDiscountSchema],
      default: [],
    },
    total: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(CartStatus),
      default: CartStatus.ACTIVE,
      required: true,
    },
    shippingEstimates: [shippingEstimateSchema],
    selectedShippingMethod: String,
    sessionId: String,
    ipAddress: String,
    userAgent: String,
    lastActivityAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: Date,
    notes: String,
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
cartSchema.index({ user: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ lastActivityAt: -1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
cartSchema.pre('save', function (next) {
  this.lastActivityAt = new Date();
  this.itemCount = this.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  this.subtotal = this.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const totalDiscount = this.discounts.reduce((sum: number, discount: any) => {
    if (discount.type === DiscountType.PERCENTAGE) {
      const discountAmount = this.subtotal * (discount.value / 100);
      return sum + (discount.maximumDiscount ? Math.min(discountAmount, discount.maximumDiscount) : discountAmount);
    } else if (discount.type === DiscountType.FIXED_AMOUNT) {
      return sum + discount.value;
    }
    return sum;
  }, 0);
  this.total = Math.max(0, this.subtotal + this.tax + this.shippingCost - totalDiscount);
  next();
});
cartSchema.methods.isEmpty = function (): boolean {
  return this.items.length === 0;
};
cartSchema.methods.hasDigitalItems = function (): boolean {
  return this.items.some((item: any) => (item.product as any).type === ProductType.DIGITAL);
};
cartSchema.methods.hasPhysicalItems = function (): boolean {
  return this.items.some((item: any) => (item.product as any).type === ProductType.PHYSICAL);
};
cartSchema.methods.requiresShipping = function (): boolean {
  return this.hasPhysicalItems();
};
cartSchema.methods.isEligibleForDiscount = function (minimumPurchase: number): boolean {
  return this.subtotal >= minimumPurchase;
};
cartSchema.methods.getTotalWeight = function (): number {
  return this.items.reduce((total: number, item: any) => {
    const product = item.product as any;
    return total + (product.weight || 0) * item.quantity;
  }, 0);
};
cartSchema.methods.getItemById = function (productId: string, selectedOptions?: Record<string, any>): CartItem | undefined {
  return this.items.find((item: any) => {
    const itemProductId = typeof item.product === 'string' ? item.product : item.product._id.toString();
    if (itemProductId !== productId) return false;
    if (!selectedOptions && !item.selectedOptions) return true;
    if (!selectedOptions || !item.selectedOptions) return false;
    return JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions);
  });
};
cartSchema.virtual('timeUntilExpiration').get(function () {
  if (!this.expiresAt) return null;
  return Math.max(0, this.expiresAt.getTime() - Date.now());
});
const cartModel = model<Cart & Document>('Cart', cartSchema);
export default cartModel;