"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const products_interface_1 = require("../../modules/products/products.interface");
const products_service_1 = tslib_1.__importDefault(require("../../modules/products/products.service"));
const s3Public_1 = tslib_1.__importDefault(require("../../utils/s3Public"));
const s3_1 = tslib_1.__importDefault(require("../../utils/s3"));
const HttpException_1 = require("../../exceptions/HttpException");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const email_service_1 = tslib_1.__importDefault(require("../../modules/email/email.service"));
const jobs_service_1 = tslib_1.__importDefault(require("../../modules/jobs/jobs.service"));
const jobs_interface_1 = require("../../modules/jobs/jobs.interface");
class ProductsController {
    constructor() {
        this.productService = new products_service_1.default();
        this.emailService = new email_service_1.default();
        this.getProducts = async (req, res, next) => {
            try {
                const query = req.query;
                const products = await this.productService.findAllProducts(query);
                res
                    .status(200)
                    .json({ data: products.data, meta: { total: products.total, page: products.page, limit: products.limit, totalPages: products.totalPages } });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.getProductById = async (req, res, next) => {
            try {
                const productId = req.params.id;
                const findOneProductData = await this.productService.findProductById(productId);
                res.status(200).json({ data: findOneProductData, message: 'findOne' });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.getProductBySku = async (req, res, next) => {
            try {
                const sku = req.params.sku;
                const findOneProductData = await this.productService.findProductBySku(sku);
                res.status(200).json({ data: findOneProductData, message: 'findOne' });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.createProduct = async (req, res, next) => {
            var _a, _b, _c, _d, _e, _f, _g;
            try {
                const productData = req.body;
                const createdProduct = await this.productService.createProduct(productData);
                if (req.file && createdProduct.type === products_interface_1.ProductType.PHYSICAL) {
                    const folder = `products/${createdProduct._id}/media`;
                    const { url } = await s3Public_1.default.uploadPublicFile(req.file, folder);
                    const updatedProduct = await this.productService.updateProduct(createdProduct._id.toString(), { images: [url] });
                    res.status(201).json({
                        message: 'Product created with media successfully',
                        data: {
                            product: updatedProduct,
                        }
                    });
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                    return;
                }
                if (req.file && createdProduct.type === products_interface_1.ProductType.DIGITAL) {
                    const folder = `products/${createdProduct._id}/media`;
                    const { key } = await s3_1.default.uploadFile(req.file, folder);
                    const updateData = {
                        digitalDeliveryInfo: Object.assign(Object.assign({}, createdProduct.digitalDeliveryInfo), { downloadUrl: key })
                    };
                    const updatedProduct = await this.productService.updateDigitalDeliveryInfo(createdProduct._id.toString(), updateData);
                    res.status(201).json({
                        message: 'Product created with media successfully',
                        data: {
                            product: updatedProduct,
                            downloadEndpoint: `/products/${createdProduct._id}/download`
                        }
                    });
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                    return;
                }
                if (req.files && createdProduct.type === products_interface_1.ProductType.EBOOK) {
                    const folder = `products/${createdProduct._id}/ebook`;
                    const ebookFiles = req.files;
                    const productId = createdProduct._id.toString();
                    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
                    const userFirstName = (_b = req.user) === null || _b === void 0 ? void 0 : _b.firstName;
                    const downloadFile = ((_c = ebookFiles['downloadUrl']) === null || _c === void 0 ? void 0 : _c[0]) || ((_d = ebookFiles['downloadFile']) === null || _d === void 0 ? void 0 : _d[0]);
                    const coverFile = ((_e = ebookFiles['bookCoverArt']) === null || _e === void 0 ? void 0 : _e[0]) || ((_f = ebookFiles['coverImage']) === null || _f === void 0 ? void 0 : _f[0]) || ((_g = ebookFiles['image']) === null || _g === void 0 ? void 0 : _g[0]);
                    const existingEbookDeliveryInfo = createdProduct.ebookDeliveryInfo;
                    const filesForCleanup = [];
                    if (downloadFile)
                        filesForCleanup.push(downloadFile);
                    if (coverFile)
                        filesForCleanup.push(coverFile);
                    const downloadFilePath = downloadFile === null || downloadFile === void 0 ? void 0 : downloadFile.path;
                    const coverFilePath = coverFile === null || coverFile === void 0 ? void 0 : coverFile.path;
                    const downloadFileMimetype = downloadFile === null || downloadFile === void 0 ? void 0 : downloadFile.mimetype;
                    const coverFileMimetype = coverFile === null || coverFile === void 0 ? void 0 : coverFile.mimetype;
                    const downloadFileOriginalName = downloadFile === null || downloadFile === void 0 ? void 0 : downloadFile.originalname;
                    const coverFileOriginalName = coverFile === null || coverFile === void 0 ? void 0 : coverFile.originalname;
                    const job = await jobs_service_1.default.createJob(jobs_interface_1.JobType.EBOOK_UPLOAD, {
                        productId,
                        downloadFilePath,
                        coverFilePath,
                        downloadFileMimetype,
                        coverFileMimetype,
                        downloadFileOriginalName,
                        coverFileOriginalName,
                        folder,
                        existingEbookDeliveryInfo,
                        userEmail,
                        userFirstName,
                    });
                    res.status(201).json({
                        message: 'Ebook product created. Files are being uploaded in the background.',
                        data: {
                            product: createdProduct,
                            uploadStatus: 'processing',
                            jobId: job._id,
                        },
                    });
                    return;
                }
                res.status(201).json({
                    message: 'Product created successfully',
                    data: createdProduct
                });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.updateProduct = async (req, res, next) => {
            try {
                const productId = req.params.id;
                const productData = req.body;
                const updateProductData = await this.productService.updateProduct(productId, productData);
                res.status(200).json({ data: updateProductData, message: 'updated' });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.deleteProduct = async (req, res, next) => {
            try {
                const productId = req.params.id;
                const deleteProductData = await this.productService.deleteProduct(productId);
                res.status(200).json({ data: deleteProductData, message: 'deleted' });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.updateStock = async (req, res, next) => {
            try {
                const productId = req.params.id;
                const { quantity } = req.body;
                const updateStockData = await this.productService.updateStock(productId, quantity);
                res.status(200).json({ data: updateStockData, message: 'stock updated' });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.searchProducts = async (req, res, next) => {
            try {
                const { query } = req.query;
                const searchResults = await this.productService.searchProducts(query);
                res.status(200).json({ data: searchResults, message: 'search results' });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.getProductsByCategory = async (req, res, next) => {
            try {
                const { category } = req.params;
                const products = await this.productService.getProductsByCategory(category);
                res.status(200).json({ data: products, message: 'category products' });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.getActiveProducts = async (req, res, next) => {
            try {
                const products = await this.productService.getActiveProducts();
                res.status(200).json({ data: products, message: 'active products' });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.getBundleProducts = async (req, res, next) => {
            try {
                const bundleProducts = await this.productService.getBundleProducts();
                res.status(200).json({ data: bundleProducts, message: 'bundle products' });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.getBundleProductById = async (req, res, next) => {
            try {
                const bundleId = req.params.id;
                const bundleProduct = await this.productService.getBundleProductById(bundleId);
                res.status(200).json({ data: bundleProduct, message: 'bundle product found' });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.calculateBundleValue = async (req, res, next) => {
            try {
                const bundleId = req.params.id;
                const valueCalculation = await this.productService.calculateBundleValue(bundleId);
                res.status(200).json({
                    data: valueCalculation,
                    message: 'bundle value calculated',
                    currency: 'NGN'
                });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.validateBundleAvailability = async (req, res, next) => {
            try {
                const bundleId = req.params.id;
                const availability = await this.productService.validateBundleAvailability(bundleId);
                res.status(200).json({
                    data: availability,
                    message: availability.available ? 'bundle is available' : 'bundle has unavailable items'
                });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.getProductsByAlbum = async (req, res, next) => {
            try {
                const album = req.params.album;
                const query = req.query;
                const products = await this.productService.findProductsByAlbum(album, query, req.user._id.toString());
                res
                    .status(200)
                    .json({ data: products.data, meta: { total: products.total, page: products.page, limit: products.limit, totalPages: products.totalPages } });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.getDigitalProductsByAlbums = async (req, res, next) => {
            try {
                const query = req.query;
                const result = await this.productService.findDigitalProductsByAlbums(query, req.user._id.toString());
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.uploadMedia = async (req, res, next) => {
            var _a, _b, _c, _d, _e;
            try {
                if (!req.file && !req.files) {
                    res.status(400).json({ message: 'No file uploaded' });
                    return;
                }
                const productId = req.params.productId;
                if (!productId) {
                    res.status(400).json({ message: 'Product ID is required' });
                    return;
                }
                const product = await this.productService.findProductById(productId);
                if (product.type === products_interface_1.ProductType.DIGITAL) {
                    if (!req.file) {
                        res.status(400).json({ message: 'No file uploaded' });
                        return;
                    }
                    const file = req.file;
                    const folder = `products/${productId}/media`;
                    const { key } = await s3_1.default.uploadFile(file, folder);
                    const updateData = {
                        digitalDeliveryInfo: Object.assign(Object.assign({}, product.digitalDeliveryInfo), { downloadUrl: key })
                    };
                    const updatedProduct = await this.productService.updateDigitalDeliveryInfo(productId, updateData);
                    res.status(200).json({
                        message: 'File uploaded and linked to product successfully',
                        data: {
                            key,
                            downloadEndpoint: `/products/${productId}/download`,
                            product: updatedProduct
                        }
                    });
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                    return;
                }
                if (product.type === products_interface_1.ProductType.EBOOK) {
                    const folder = `products/${productId}/ebook`;
                    const ebookFiles = req.files || {};
                    const singleFile = req.file;
                    let downloadUrl;
                    let bookCoverArt;
                    const downloadFile = ((_a = ebookFiles['downloadUrl']) === null || _a === void 0 ? void 0 : _a[0]) || ((_b = ebookFiles['downloadFile']) === null || _b === void 0 ? void 0 : _b[0]) ||
                        (singleFile && !singleFile.mimetype.startsWith('image/') ? singleFile : null);
                    if (downloadFile) {
                        const { key } = await s3_1.default.uploadFile(downloadFile, `${folder}/download`);
                        downloadUrl = key;
                    }
                    const coverFile = ((_c = ebookFiles['bookCoverArt']) === null || _c === void 0 ? void 0 : _c[0]) || ((_d = ebookFiles['coverImage']) === null || _d === void 0 ? void 0 : _d[0]) || ((_e = ebookFiles['image']) === null || _e === void 0 ? void 0 : _e[0]) ||
                        (singleFile && singleFile.mimetype.startsWith('image/') ? singleFile : null);
                    if (coverFile) {
                        const { url } = await s3Public_1.default.uploadPublicFile(coverFile, `${folder}/cover`);
                        bookCoverArt = url;
                    }
                    if (!downloadUrl && !bookCoverArt) {
                        res.status(400).json({ message: 'No valid ebook file or cover image uploaded' });
                        return;
                    }
                    const updateData = {
                        ebookDeliveryInfo: Object.assign(Object.assign(Object.assign({}, product.ebookDeliveryInfo), (downloadUrl && { downloadUrl })), (bookCoverArt && { bookCoverArt }))
                    };
                    const updatedProduct = await this.productService.updateEbookDeliveryInfo(productId, updateData);
                    res.status(200).json({
                        message: 'Ebook files uploaded and linked to product successfully',
                        data: {
                            downloadUrl,
                            bookCoverArt,
                            downloadEndpoint: `/products/${productId}/download`,
                            product: updatedProduct
                        }
                    });
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                    return;
                }
                throw new HttpException_1.HttpException(400, 'Media can only be uploaded for digital or ebook products');
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
        this.downloadMedia = async (req, res, next) => {
            var _a, _b;
            try {
                const productId = req.params.productId;
                const userId = req.user._id.toString();
                const product = await this.productService.findProductById(productId);
                let downloadUrl;
                if (product.type === products_interface_1.ProductType.DIGITAL && ((_a = product.digitalDeliveryInfo) === null || _a === void 0 ? void 0 : _a.downloadUrl)) {
                    downloadUrl = product.digitalDeliveryInfo.downloadUrl;
                }
                else if (product.type === products_interface_1.ProductType.EBOOK && ((_b = product.ebookDeliveryInfo) === null || _b === void 0 ? void 0 : _b.downloadUrl)) {
                    downloadUrl = product.ebookDeliveryInfo.downloadUrl;
                }
                if (!downloadUrl) {
                    throw new HttpException_1.HttpException(404, 'Download not available');
                }
                const hasAccess = await this.productService.verifyUserProductAccess(userId, productId);
                if (!hasAccess) {
                    throw new HttpException_1.HttpException(403, 'You do not have access to this download');
                }
                const signedUrl = await s3_1.default.getSignedUrl(downloadUrl);
                res.status(200).json({
                    message: 'Download URL generated successfully',
                    data: {
                        url: signedUrl,
                        expiresIn: 604800
                    }
                });
            }
            catch (error) {
                console.error('Create Product Error:', error);
                if (req.file)
                    (0, upload_middleware_1.cleanupTempFiles)(req.file);
                if (req.files)
                    (0, upload_middleware_1.cleanupTempFiles)(req.files);
                next(error);
            }
        };
    }
}
exports.default = ProductsController;
//# sourceMappingURL=products.controller.js.map