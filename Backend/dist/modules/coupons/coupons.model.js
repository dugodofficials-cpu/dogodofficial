"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const coupons_interface_1 = require("./coupons.interface");
const couponSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: Object.values(coupons_interface_1.CouponType),
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
        enum: Object.values(coupons_interface_1.CouponStatus),
        default: coupons_interface_1.CouponStatus.ACTIVE,
    },
    conditions: {
        applicableProducts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' }],
        applicableCategories: [{ type: String }],
        excludedProducts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' }],
        excludedCategories: [{ type: String }],
        firstPurchaseOnly: { type: Boolean, default: false },
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
couponSchema.index({ code: 1 });
couponSchema.index({ status: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
const couponModel = (0, mongoose_1.model)('Coupon', couponSchema);
exports.default = couponModel;
//# sourceMappingURL=coupons.model.js.map