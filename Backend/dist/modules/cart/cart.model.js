"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cart_interface_1 = require("../../modules/cart/cart.interface");
const products_interface_1 = require("../../modules/products/products.interface");
const cartItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        of: mongoose_1.Schema.Types.Mixed,
    },
    notes: String,
    addedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updatedAt: Date,
}, { _id: false });
const appliedDiscountSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        uppercase: true,
    },
    type: {
        type: String,
        enum: Object.values(cart_interface_1.DiscountType),
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
        of: mongoose_1.Schema.Types.Mixed,
    },
}, { _id: false });
const shippingEstimateSchema = new mongoose_1.Schema({
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
}, { _id: false });
const cartSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: {
        type: [cartItemSchema],
        default: [],
        validate: [
            {
                validator: function (items) {
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
        enum: Object.values(cart_interface_1.CartStatus),
        default: cart_interface_1.CartStatus.ACTIVE,
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
        of: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
cartSchema.index({ user: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ lastActivityAt: -1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
cartSchema.pre('save', function (next) {
    this.lastActivityAt = new Date();
    this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiscount = this.discounts.reduce((sum, discount) => {
        if (discount.type === cart_interface_1.DiscountType.PERCENTAGE) {
            const discountAmount = this.subtotal * (discount.value / 100);
            return sum + (discount.maximumDiscount ? Math.min(discountAmount, discount.maximumDiscount) : discountAmount);
        }
        else if (discount.type === cart_interface_1.DiscountType.FIXED_AMOUNT) {
            return sum + discount.value;
        }
        return sum;
    }, 0);
    this.total = Math.max(0, this.subtotal + this.tax + this.shippingCost - totalDiscount);
    next();
});
cartSchema.methods.isEmpty = function () {
    return this.items.length === 0;
};
cartSchema.methods.hasDigitalItems = function () {
    return this.items.some(item => item.product.type === products_interface_1.ProductType.DIGITAL);
};
cartSchema.methods.hasPhysicalItems = function () {
    return this.items.some(item => item.product.type === products_interface_1.ProductType.PHYSICAL);
};
cartSchema.methods.requiresShipping = function () {
    return this.hasPhysicalItems();
};
cartSchema.methods.isEligibleForDiscount = function (minimumPurchase) {
    return this.subtotal >= minimumPurchase;
};
cartSchema.methods.getTotalWeight = function () {
    return this.items.reduce((total, item) => {
        const product = item.product;
        return total + (product.weight || 0) * item.quantity;
    }, 0);
};
cartSchema.methods.getItemById = function (productId, selectedOptions) {
    return this.items.find(item => {
        const itemProductId = typeof item.product === 'string' ? item.product : item.product._id.toString();
        if (itemProductId !== productId)
            return false;
        if (!selectedOptions && !item.selectedOptions)
            return true;
        if (!selectedOptions || !item.selectedOptions)
            return false;
        return JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions);
    });
};
cartSchema.virtual('timeUntilExpiration').get(function () {
    if (!this.expiresAt)
        return null;
    return Math.max(0, this.expiresAt.getTime() - Date.now());
});
const cartModel = (0, mongoose_1.model)('Cart', cartSchema);
exports.default = cartModel;
//# sourceMappingURL=cart.model.js.map