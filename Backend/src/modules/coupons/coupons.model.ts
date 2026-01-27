import { model, Schema } from 'mongoose';
import { Coupon, CouponType, CouponStatus } from './coupons.interface';
const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: Object.values(CouponType),
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
  minimumPurchase: {
    type: Number,
    min: 0,
  },
  maximumDiscount: {
    type: Number,
    min: 0,
  },
  usageLimit: {
    type: Number,
    min: 0,
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(CouponStatus),
    default: CouponStatus.ACTIVE,
  },
  conditions: {
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: String }],
    excludedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    excludedCategories: [{ type: String }],
    firstPurchaseOnly: { type: Boolean, default: false },
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});
couponSchema.index({ code: 1 });
couponSchema.index({ status: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
const couponModel = model<Coupon>('Coupon', couponSchema);
export default couponModel;