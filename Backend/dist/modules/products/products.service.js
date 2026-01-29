"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HttpException_1 = require("../../exceptions/HttpException");
const products_interface_1 = require("../../modules/products/products.interface");
const products_model_1 = tslib_1.__importDefault(require("../../modules/products/products.model"));
const orders_model_1 = tslib_1.__importDefault(require("../../modules/orders/orders.model"));
const orders_interface_1 = require("../../modules/orders/orders.interface");
const util_1 = require("../../utils/util");
const logger_1 = require("../../utils/logger");
const album_covers_model_1 = require("../../modules/album-covers/album-covers.model");
class ProductService {
    constructor() {
        this.products = products_model_1.default;
    }
    async findAllProducts(query, isAdmin = false) {
        const { page = 1, limit = 10, search, type, status, category, tag, minPrice, maxPrice, isActive, exclude, sortBy = 'createdAt', sortOrder = 'desc', includeBundleItems = false, } = query;
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { album: { $regex: search, $options: 'i' } },
            ];
        }
        if (type)
            filter.type = includeBundleItems ? { $in: [type, products_interface_1.ProductType.BUNDLE, products_interface_1.ProductType.EBOOK] } : type === products_interface_1.ProductType.PHYSICAL ? { $in: [type, products_interface_1.ProductType.EBOOK] } : type;
        if (status)
            filter.status = status;
        if (category) {
            const categories = category.includes(',') ? category.split(',').map(c => c.trim()) : [category];
            filter.categories = { $in: categories };
        }
        if (tag)
            filter.tags = tag;
        if (isActive !== undefined)
            filter.isActive = isActive;
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined)
                filter.price.$gte = minPrice;
            if (maxPrice !== undefined)
                filter.price.$lte = maxPrice;
        }
        if (exclude) {
            filter._id = { $ne: exclude };
        }
        const sort = {
            order: 1,
            [sortBy]: sortOrder === 'desc' ? -1 : 1,
        };
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            this.products.find(filter).sort(sort).skip(skip).limit(limit).populate('albumId'),
            this.products.countDocuments(filter),
        ]);
        return {
            data: products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findProductById(productId) {
        if ((0, util_1.isEmpty)(productId))
            throw new HttpException_1.HttpException(400, 'ProductId is empty');
        const findProduct = await this.products.findOne({ _id: productId }).populate('albumId');
        if (!findProduct)
            throw new HttpException_1.HttpException(409, "Product doesn't exist");
        return findProduct;
    }
    async findProductBySku(sku) {
        if ((0, util_1.isEmpty)(sku))
            throw new HttpException_1.HttpException(400, 'SKU is empty');
        const findProduct = await this.products.findOne({ sku: sku.toUpperCase() }).populate('albumId');
        if (!findProduct)
            throw new HttpException_1.HttpException(409, "Product doesn't exist");
        return findProduct;
    }
    async createProduct(productData) {
        if ((0, util_1.isEmpty)(productData))
            throw new HttpException_1.HttpException(400, 'productData is empty');
        const findProduct = await this.products.findOne({ sku: productData.sku.toUpperCase() });
        if (findProduct)
            throw new HttpException_1.HttpException(409, `Product with SKU ${productData.sku} already exists`);
        if (productData.type === products_interface_1.ProductType.PHYSICAL) {
            if (productData.stockQuantity === undefined) {
                throw new HttpException_1.HttpException(400, 'Physical products require stock quantity');
            }
        }
        else if (productData.type === products_interface_1.ProductType.DIGITAL) {
            if (!productData.album) {
                throw new HttpException_1.HttpException(400, 'Digital products require album name');
            }
            if (!productData.duration) {
                throw new HttpException_1.HttpException(400, 'Digital products require duration');
            }
        }
        else if (productData.type === products_interface_1.ProductType.EBOOK) {
        }
        else if (productData.type === products_interface_1.ProductType.BUNDLE) {
            if (!productData.bundleItems || productData.bundleItems.length === 0) {
                throw new HttpException_1.HttpException(400, 'Bundle products require at least one bundle item');
            }
            if (!productData.bundlePrice || productData.bundlePrice <= 0) {
                throw new HttpException_1.HttpException(400, 'Bundle products require a valid bundle price');
            }
            for (const item of productData.bundleItems) {
                if (!item.title || item.title.trim() === '') {
                    throw new HttpException_1.HttpException(400, 'Bundle items must have a title');
                }
                if (item.productId === '' || item.productId === null) {
                    item.productId = undefined;
                }
                if (item.productId) {
                    const referencedProduct = await this.products.findById(item.productId);
                    if (!referencedProduct) {
                        throw new HttpException_1.HttpException(400, `Bundle item references non-existent product: ${item.productId}`);
                    }
                    if (referencedProduct.type === products_interface_1.ProductType.BUNDLE) {
                        throw new HttpException_1.HttpException(400, 'Bundle products cannot contain other bundle products');
                    }
                }
            }
            if (productData.minItems && productData.maxItems && productData.minItems > productData.maxItems) {
                throw new HttpException_1.HttpException(400, 'minItems cannot be greater than maxItems');
            }
        }
        const createProductData = await this.products.create(Object.assign(Object.assign({}, productData), { sku: productData.sku.toUpperCase(), status: productData.status || products_interface_1.ProductStatus.DRAFT }));
        return await this.products.findById(createProductData._id).populate('albumId');
    }
    async updateProduct(productId, productData) {
        if ((0, util_1.isEmpty)(productData))
            throw new HttpException_1.HttpException(400, 'productData is empty');
        if (productData.sku) {
            const findProduct = await this.products.findOne({ sku: productData.sku.toUpperCase() });
            if (findProduct && findProduct._id != productId) {
                throw new HttpException_1.HttpException(409, `Product with SKU ${productData.sku} already exists`);
            }
            productData.sku = productData.sku.toUpperCase();
        }
        const currentProduct = await this.findProductById(productId);
        if (productData.type && productData.type !== currentProduct.type) {
            if (productData.type === products_interface_1.ProductType.PHYSICAL) {
                if (!productData.dimensions) {
                    throw new HttpException_1.HttpException(400, 'Physical products require dimensions');
                }
                if (productData.stockQuantity === undefined) {
                    throw new HttpException_1.HttpException(400, 'Physical products require stock quantity');
                }
            }
            else if (productData.type === products_interface_1.ProductType.DIGITAL) {
                if (!productData.digitalDeliveryInfo) {
                    throw new HttpException_1.HttpException(400, 'Digital products require delivery information');
                }
                if (!productData.album) {
                    throw new HttpException_1.HttpException(400, 'Digital products require album name');
                }
                if (!productData.albumPrice) {
                    throw new HttpException_1.HttpException(400, 'Digital products require album price');
                }
                if (!productData.duration) {
                    throw new HttpException_1.HttpException(400, 'Digital products require duration');
                }
            }
            else if (productData.type === products_interface_1.ProductType.EBOOK) {
            }
            else if (productData.type === products_interface_1.ProductType.BUNDLE) {
                if (!productData.bundleItems || productData.bundleItems.length === 0) {
                    throw new HttpException_1.HttpException(400, 'Bundle products require at least one bundle item');
                }
                if (!productData.bundlePrice || productData.bundlePrice <= 0) {
                    throw new HttpException_1.HttpException(400, 'Bundle products require a valid bundle price');
                }
                for (const item of productData.bundleItems) {
                    if (!item.title || item.title.trim() === '') {
                        throw new HttpException_1.HttpException(400, 'Bundle items must have a title');
                    }
                    if (item.productId === '' || item.productId === null) {
                        item.productId = undefined;
                    }
                    if (item.productId) {
                        const referencedProduct = await this.products.findById(item.productId);
                        if (!referencedProduct) {
                            throw new HttpException_1.HttpException(400, `Bundle item references non-existent product: ${item.productId}`);
                        }
                        if (referencedProduct.type === products_interface_1.ProductType.BUNDLE) {
                            throw new HttpException_1.HttpException(400, 'Bundle products cannot contain other bundle products');
                        }
                    }
                }
                if (productData.minItems && productData.maxItems && productData.minItems > productData.maxItems) {
                    throw new HttpException_1.HttpException(400, 'minItems cannot be greater than maxItems');
                }
            }
        }
        const updateProductById = await this.products.findByIdAndUpdate(productId, productData, { new: true }).populate('albumId');
        if (!updateProductById)
            throw new HttpException_1.HttpException(409, "Product doesn't exist");
        return updateProductById;
    }
    async deleteProduct(productId) {
        const deleteProductById = await this.products.findByIdAndDelete(productId);
        if (!deleteProductById)
            throw new HttpException_1.HttpException(409, "Product doesn't exist");
        return deleteProductById;
    }
    async updateStock(productId, quantity) {
        const product = await this.findProductById(productId);
        if (product.type !== products_interface_1.ProductType.PHYSICAL) {
            throw new HttpException_1.HttpException(400, 'Cannot update stock for non-physical products');
        }
        if (product.stockQuantity + quantity < 0) {
            throw new HttpException_1.HttpException(400, 'Insufficient stock');
        }
        const updatedProduct = await this.products.findByIdAndUpdate(productId, {
            $inc: { stockQuantity: quantity },
            $set: {
                status: product.stockQuantity + quantity === 0 ? products_interface_1.ProductStatus.OUT_OF_STOCK : products_interface_1.ProductStatus.ACTIVE,
            },
        }, { new: true });
        if (updatedProduct.stockQuantity <= updatedProduct.lowStockThreshold) {
            logger_1.logger.info(`Low stock alert for product ${updatedProduct.sku}`);
        }
        return updatedProduct;
    }
    async searchProducts(query) {
        return this.products.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } }).sort({ order: 1, score: { $meta: 'textScore' } }).populate('albumId');
    }
    async getProductsByCategory(category) {
        return this.products.find({ categories: category }).sort({ order: 1 }).populate('albumId');
    }
    async getActiveProducts() {
        return this.products.find({
            status: products_interface_1.ProductStatus.ACTIVE,
            isActive: true,
        }).sort({ order: 1 }).populate('albumId');
    }
    async findProductsByAlbum(album, query, userId) {
        const { page = 1, limit = null, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        let albumCover = await album_covers_model_1.AlbumCoverModel.findOne({ title: album });
        ;
        let skip = 0;
        if (limit === null) {
            skip = 0;
        }
        else {
            skip = (page - 1) * limit;
        }
        if (!albumCover) {
            return {
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        const filter = {
            albumId: albumCover._id,
            status: products_interface_1.ProductStatus.ACTIVE,
        };
        const sort = {
            order: 1,
            [sortBy]: sortOrder === 'desc' ? -1 : 1,
        };
        const [products, total] = await Promise.all([
            this.products.find(filter).sort(sort).skip(skip).limit(limit === null ? null : limit).populate('albumId'),
            this.products.countDocuments(filter),
        ]);
        const userOrders = await orders_model_1.default.find({
            user: userId,
            status: { $nin: [orders_interface_1.OrderStatus.CANCELLED, orders_interface_1.OrderStatus.PENDING] },
            'items.product': { $in: products.map(p => p._id) }
        }).select('items.product');
        const purchasedProductIds = new Set(userOrders.flatMap(order => order.items.map(item => item.product.toString())));
        const processedProducts = products.map(product => {
            const productCopy = product.toObject();
            if (!purchasedProductIds.has(product._id.toString())) {
                delete productCopy.digitalDeliveryInfo;
            }
            return productCopy;
        });
        return {
            data: processedProducts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / (limit === null ? total : limit)),
        };
    }
    async findDigitalProductsByAlbums(query, userId) {
        const { page = 1, limit = 10, search, minPrice, maxPrice, sortBy = 'album', sortOrder = 'asc' } = query;
        const albumCoverFilter = {};
        if (search) {
            albumCoverFilter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const albumSort = {};
        if (sortBy === 'album') {
            albumSort.title = sortOrder === 'asc' ? 1 : -1;
        }
        else {
            albumSort.createdAt = sortOrder === 'asc' ? 1 : -1;
        }
        const skip = (page - 1) * limit;
        const totalAlbums = await album_covers_model_1.AlbumCoverModel.countDocuments(albumCoverFilter);
        const albumCovers = await album_covers_model_1.AlbumCoverModel.find(albumCoverFilter)
            .sort(albumSort)
            .skip(skip)
            .limit(limit);
        const albumIds = albumCovers.map(cover => cover._id);
        const productsFilter = {
            type: products_interface_1.ProductType.DIGITAL,
            isActive: true,
            status: products_interface_1.ProductStatus.ACTIVE,
            albumId: { $in: albumIds },
        };
        if (minPrice !== undefined || maxPrice !== undefined) {
            productsFilter.price = {};
            if (minPrice !== undefined)
                productsFilter.price.$gte = minPrice;
            if (maxPrice !== undefined)
                productsFilter.price.$lte = maxPrice;
        }
        if (search) {
            productsFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { album: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const productSort = {
            order: 1,
        };
        if (sortBy === 'album') {
            productSort.name = 1;
        }
        else {
            productSort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }
        const products = await this.products.find(productsFilter).sort(productSort);
        const userOrders = await orders_model_1.default.find({
            user: userId,
            status: { $nin: [orders_interface_1.OrderStatus.CANCELLED, orders_interface_1.OrderStatus.PENDING] },
            'items.product': { $in: products.map(p => p._id) }
        }).select('items.product');
        const purchasedProductIds = new Set(userOrders.flatMap(order => order.items.map(item => item.product.toString())));
        const productsByAlbumId = products.reduce((acc, product) => {
            const albumId = product.albumId;
            if (!albumId)
                return acc;
            const albumIdStr = typeof albumId === 'object' && albumId !== null && albumId._id
                ? albumId._id.toString()
                : String(albumId);
            if (!acc[albumIdStr]) {
                acc[albumIdStr] = [];
            }
            const productCopy = product.toObject();
            if (!purchasedProductIds.has(product._id.toString())) {
                delete productCopy.digitalDeliveryInfo;
            }
            acc[albumIdStr].push(productCopy);
            return acc;
        }, {});
        const albumsData = albumCovers.map(albumCover => {
            const albumIdStr = albumCover._id.toString();
            const albumProducts = productsByAlbumId[albumIdStr] || [];
            const albumPrice = albumProducts.length > 0 ? albumProducts[0].albumPrice : 0;
            return {
                album: albumCover.title || 'Unknown Album',
                coverImage: albumCover.imageUrl || null,
                albumPrice,
                totalTracks: albumProducts.length,
                products: albumProducts,
                albumCover: albumCover.toObject(),
            };
        });
        const totalTracks = Object.values(productsByAlbumId).reduce((sum, products) => sum + products.length, 0);
        return {
            data: albumsData,
            meta: {
                totalAlbums,
                totalTracks,
                page,
                limit,
                totalPages: Math.ceil(totalAlbums / limit),
            },
        };
    }
    async verifyUserProductAccess(userId, productId) {
        const order = await orders_model_1.default.findOne({
            user: userId,
            'items.product': productId,
            status: { $nin: [orders_interface_1.OrderStatus.CANCELLED, orders_interface_1.OrderStatus.PENDING] }
        });
        return !!order;
    }
    async updateDigitalDeliveryInfo(productId, updateData) {
        const product = await this.findProductById(productId);
        if (product.type !== products_interface_1.ProductType.DIGITAL) {
            throw new HttpException_1.HttpException(400, 'Digital delivery info can only be updated for digital products');
        }
        const updateProductById = await this.products.findByIdAndUpdate(productId, { digitalDeliveryInfo: updateData.digitalDeliveryInfo }, { new: true }).populate('albumId');
        if (!updateProductById)
            throw new HttpException_1.HttpException(409, "Product doesn't exist");
        return updateProductById;
    }
    async updateEbookDeliveryInfo(productId, updateData) {
        var _a;
        const product = await this.findProductById(productId);
        if (product.type !== products_interface_1.ProductType.EBOOK) {
            throw new HttpException_1.HttpException(400, 'Ebook delivery info can only be updated for ebook products');
        }
        const updateObject = {
            ebookDeliveryInfo: updateData.ebookDeliveryInfo
        };
        if ((_a = updateData.ebookDeliveryInfo) === null || _a === void 0 ? void 0 : _a.bookCoverArt) {
            const existingImages = product.images || [];
            if (!existingImages.includes(updateData.ebookDeliveryInfo.bookCoverArt)) {
                updateObject.images = [...existingImages, updateData.ebookDeliveryInfo.bookCoverArt];
            }
        }
        const updateProductById = await this.products.findByIdAndUpdate(productId, updateObject, { new: true }).populate('albumId');
        if (!updateProductById)
            throw new HttpException_1.HttpException(409, "Product doesn't exist");
        return updateProductById;
    }
    async getBundleProducts() {
        return this.products.find({
            type: products_interface_1.ProductType.BUNDLE,
            isActive: true,
            status: products_interface_1.ProductStatus.ACTIVE,
        }).sort({ order: 1 }).populate('bundleItems.productId').populate('albumId');
    }
    async getBundleProductById(bundleId) {
        const bundle = await this.products.findById(bundleId)
            .populate('bundleItems.productId')
            .populate('bundleItems.productId.dimensions')
            .populate('bundleItems.productId.digitalDeliveryInfo')
            .populate('albumId');
        if (!bundle) {
            throw new HttpException_1.HttpException(404, 'Bundle product not found');
        }
        if (bundle.type !== products_interface_1.ProductType.BUNDLE) {
            throw new HttpException_1.HttpException(400, 'Product is not a bundle');
        }
        return bundle;
    }
    async calculateBundleValue(bundleId) {
        const bundle = await this.getBundleProductById(bundleId);
        let totalValue = 0;
        for (const item of bundle.bundleItems) {
            if (item.productId) {
                const product = item.productId;
                if (product && typeof product === 'object' && product.price) {
                    const itemValue = product.price * item.quantity;
                    totalValue += itemValue;
                }
            }
        }
        const bundlePrice = bundle.bundlePrice || 0;
        const savings = totalValue - bundlePrice;
        return {
            totalValue: Math.round(totalValue * 100) / 100,
            bundlePrice: Math.round(bundlePrice * 100) / 100,
            savings: Math.round(savings * 100) / 100,
        };
    }
    async validateBundleAvailability(bundleId) {
        const bundle = await this.getBundleProductById(bundleId);
        const unavailableItems = [];
        for (const item of bundle.bundleItems) {
            if (!item.productId) {
                continue;
            }
            const product = item.productId;
            if (product && typeof product === 'object') {
                if (product.type === products_interface_1.ProductType.PHYSICAL) {
                    if (!product.stockQuantity || product.stockQuantity < item.quantity) {
                        unavailableItems.push(`${product.name} (Required: ${item.quantity}, Available: ${product.stockQuantity || 0})`);
                    }
                }
                else if (product.type === products_interface_1.ProductType.DIGITAL) {
                    if (!product.isActive || product.status !== products_interface_1.ProductStatus.ACTIVE) {
                        unavailableItems.push(`${product.name} (Inactive)`);
                    }
                }
            }
        }
        return {
            available: unavailableItems.length === 0,
            unavailableItems,
        };
    }
}
exports.default = ProductService;
//# sourceMappingURL=products.service.js.map