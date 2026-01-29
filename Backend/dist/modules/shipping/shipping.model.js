"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingPackageModel = exports.ShippingLabelModel = exports.ShippingRateModel = exports.ShippingZoneModel = exports.ShippingProviderModel = void 0;
const mongoose_1 = require("mongoose");
const shipping_interface_1 = require("../../modules/shipping/shipping.interface");
const addressSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    company: String,
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: String,
}, { _id: false });
const dimensionsSchema = new mongoose_1.Schema({
    length: {
        type: Number,
        required: true,
        min: 0,
    },
    width: {
        type: Number,
        required: true,
        min: 0,
    },
    height: {
        type: Number,
        required: true,
        min: 0,
    },
    unit: {
        type: String,
        required: true,
        enum: ['cm', 'in'],
    },
}, { _id: false });
const trackingHistorySchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: Object.values(shipping_interface_1.ShippingStatus),
        required: true,
    },
    location: String,
    timestamp: {
        type: Date,
        required: true,
    },
    description: String,
}, { _id: false });
const providerSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        enum: Object.values(shipping_interface_1.ShippingProviderType),
        required: true,
    },
    description: String,
    website: String,
    apiEndpoint: String,
    apiKey: {
        type: String,
        select: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    supportedCountries: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Country',
        },
    ],
    supportedMethods: [
        {
            type: String,
            enum: Object.values(shipping_interface_1.ShippingMethodType),
        },
    ],
    settings: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
    },
    metadata: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
const zoneSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    countries: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Country',
        },
    ],
    rate: {
        type: Number,
        required: true,
    },
    regions: [String],
    postalCodes: [String],
    isActive: {
        type: Boolean,
        default: true,
    },
    metadata: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
const rateSchema = new mongoose_1.Schema({
    provider: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ShippingProvider',
        required: true,
    },
    zone: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ShippingZone',
        required: true,
    },
    method: {
        type: String,
        enum: Object.values(shipping_interface_1.ShippingMethodType),
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(shipping_interface_1.ShippingRateType),
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    minimumOrderAmount: {
        type: Number,
        min: 0,
    },
    maximumOrderAmount: {
        type: Number,
        min: 0,
    },
    minimumWeight: {
        type: Number,
        min: 0,
    },
    maximumWeight: {
        type: Number,
        min: 0,
    },
    baseRate: {
        type: Number,
        required: true,
        min: 0,
    },
    additionalRate: {
        type: Number,
        min: 0,
    },
    freeShippingThreshold: {
        type: Number,
        min: 0,
    },
    weightIncrement: {
        type: Number,
        min: 0,
    },
    priceIncrement: {
        type: Number,
        min: 0,
    },
    distanceIncrement: {
        type: Number,
        min: 0,
    },
    restrictions: {
        excludedProducts: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        excludedCategories: [String],
        maxDimensions: dimensionsSchema,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    metadata: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
const labelSchema = new mongoose_1.Schema({
    provider: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ShippingProvider',
        required: true,
    },
    trackingNumber: {
        type: String,
        required: true,
        unique: true,
    },
    trackingUrl: String,
    labelUrl: {
        type: String,
        required: true,
    },
    cost: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        required: true,
        length: 3,
        uppercase: true,
    },
    status: {
        type: String,
        enum: Object.values(shipping_interface_1.ShippingStatus),
        default: shipping_interface_1.ShippingStatus.PENDING,
    },
    weight: {
        type: Number,
        required: true,
        min: 0,
    },
    weightUnit: {
        type: String,
        required: true,
        enum: ['kg', 'lb'],
    },
    dimensions: dimensionsSchema,
    fromAddress: {
        type: addressSchema,
        required: true,
    },
    toAddress: {
        type: addressSchema,
        required: true,
    },
    trackingHistory: [trackingHistorySchema],
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    metadata: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
const packageSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    length: {
        type: Number,
        required: true,
        min: 0,
    },
    width: {
        type: Number,
        required: true,
        min: 0,
    },
    height: {
        type: Number,
        required: true,
        min: 0,
    },
    dimensionUnit: {
        type: String,
        required: true,
        enum: ['cm', 'in'],
    },
    weight: {
        type: Number,
        required: true,
        min: 0,
    },
    weightUnit: {
        type: String,
        required: true,
        enum: ['kg', 'lb'],
    },
    maxWeight: {
        type: Number,
        required: true,
        min: 0,
    },
    volume: {
        type: Number,
        required: true,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    metadata: {
        type: Map,
        of: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
providerSchema.index({ name: 1 }, { unique: true });
providerSchema.index({ isActive: 1 });
providerSchema.index({ type: 1 });
zoneSchema.index({ name: 1 });
zoneSchema.index({ isActive: 1 });
zoneSchema.index({ countries: 1 });
zoneSchema.index({ postalCodes: 1 });
rateSchema.index({ provider: 1, zone: 1, method: 1 }, { unique: true });
rateSchema.index({ isActive: 1 });
rateSchema.index({ type: 1 });
labelSchema.index({ trackingNumber: 1 }, { unique: true });
labelSchema.index({ provider: 1 });
labelSchema.index({ status: 1 });
labelSchema.index({ 'fromAddress.postalCode': 1 });
labelSchema.index({ 'toAddress.postalCode': 1 });
labelSchema.index({ estimatedDeliveryDate: 1 });
packageSchema.index({ name: 1 });
packageSchema.index({ isActive: 1 });
packageSchema.virtual('calculatedVolume').get(function () {
    return this.length * this.width * this.height;
});
exports.ShippingProviderModel = (0, mongoose_1.model)('ShippingProvider', providerSchema);
exports.ShippingZoneModel = (0, mongoose_1.model)('ShippingZone', zoneSchema);
exports.ShippingRateModel = (0, mongoose_1.model)('ShippingRate', rateSchema);
exports.ShippingLabelModel = (0, mongoose_1.model)('ShippingLabel', labelSchema);
exports.ShippingPackageModel = (0, mongoose_1.model)('ShippingPackage', packageSchema);
//# sourceMappingURL=shipping.model.js.map