"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const products_interface_1 = require("../../modules/products/products.interface");
const productDimensionsSchema = new mongoose_1.Schema({
    weight: { type: Number, required: true },
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
}, { _id: false });
const digitalDeliveryInfoSchema = new mongoose_1.Schema({
    downloadUrl: { type: String },
    accessKey: { type: String },
    expiryDays: { type: Number },
    maxDownloads: { type: Number },
}, { _id: false });
const ebookDeliveryInfoSchema = new mongoose_1.Schema({
    downloadUrl: { type: String },
    bookCoverArt: { type: String },
    accessKey: { type: String },
    expiryDays: { type: Number },
    maxDownloads: { type: Number },
}, { _id: false });
const bundleItemSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
        default: null,
        set: (value) => {
            if (value === '' || value === null || value === undefined) {
                return null;
            }
            return value;
        }
    },
    quantity: { type: Number, required: true, min: 1 },
    title: { type: String, required: true },
    discountPercentage: { type: Number, min: 0, max: 100 },
}, { _id: false });
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    album: {
        type: String,
        required: function () {
            return this.type === products_interface_1.ProductType.DIGITAL;
        },
        trim: true,
    },
    albumPrice: {
        type: Number,
        required: function () {
            return this.type === products_interface_1.ProductType.DIGITAL;
        },
        min: 0,
    },
    duration: {
        type: String,
        required: function () {
            return this.type === products_interface_1.ProductType.DIGITAL;
        },
    },
    description: {
        type: String,
        required: true,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        enum: Object.values(products_interface_1.ProductType),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(products_interface_1.ProductStatus),
        default: products_interface_1.ProductStatus.DRAFT,
    },
    categories: [
        {
            type: String,
            required: true,
        },
    ],
    tags: [
        {
            type: String,
        },
    ],
    images: [
        {
            type: String,
            required: true,
        },
    ],
    dimensions: {
        type: productDimensionsSchema,
    },
    sizes: [
        {
            type: String,
            required: function () {
                return this.type === products_interface_1.ProductType.PHYSICAL;
            },
        },
    ],
    color: {
        type: String,
        required: function () {
            return this.type === products_interface_1.ProductType.PHYSICAL;
        },
    },
    stockQuantity: {
        type: Number,
        required: function () {
            return this.type === products_interface_1.ProductType.PHYSICAL;
        },
        min: 0,
    },
    lowStockThreshold: {
        type: Number,
        min: 0,
    },
    digitalDeliveryInfo: {
        type: digitalDeliveryInfoSchema,
    },
    ebookDeliveryInfo: {
        type: ebookDeliveryInfoSchema,
    },
    albumId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'AlbumCover',
    },
    bundleItems: {
        type: [bundleItemSchema],
        required: function () {
            return this.type === products_interface_1.ProductType.BUNDLE;
        },
    },
    bundlePrice: {
        type: Number,
        required: function () {
            return this.type === products_interface_1.ProductType.BUNDLE;
        },
        min: 0,
    },
    bundleTier: {
        type: String,
        enum: ['platinum', 'diamond', 'gold'],
        default: 'platinum',
    },
    isCustomizable: {
        type: Boolean,
        default: false,
    },
    minItems: {
        type: Number,
        min: 1,
    },
    maxItems: {
        type: Number,
        min: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ album: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ type: 1 });
productSchema.index({ status: 1 });
const productModel = (0, mongoose_1.model)('Product', productSchema);
exports.default = productModel;
//# sourceMappingURL=products.model.js.map