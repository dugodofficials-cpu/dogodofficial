"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const products_controller_1 = tslib_1.__importDefault(require("../../modules/products/products.controller"));
const products_dto_1 = require("../../modules/products/products.dto");
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
const permission_middleware_1 = require("../../middlewares/permission.middleware");
const roles_interface_1 = require("../roles/roles.interface");
const upload_middleware_1 = tslib_1.__importDefault(require("../../middlewares/upload.middleware"));
class ProductsRoute {
    constructor() {
        this.path = '/products';
        this.router = (0, express_1.Router)();
        this.productsController = new products_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, auth_middleware_1.default, this.productsController.getProducts);
        this.router.get(`${this.path}/active`, auth_middleware_1.default, this.productsController.getActiveProducts);
        this.router.get(`${this.path}/search`, auth_middleware_1.default, this.productsController.searchProducts);
        this.router.get(`${this.path}/category/:category`, auth_middleware_1.default, this.productsController.getProductsByCategory);
        this.router.get(`${this.path}/digital/albums`, auth_middleware_1.default, this.productsController.getDigitalProductsByAlbums);
        this.router.get(`${this.path}/:id`, auth_middleware_1.default, this.productsController.getProductById);
        this.router.get(`${this.path}/sku/:sku`, auth_middleware_1.default, this.productsController.getProductBySku);
        this.router.get(`${this.path}/album/:album`, auth_middleware_1.default, this.productsController.getProductsByAlbum);
        this.router.get(`${this.path}/bundles`, auth_middleware_1.default, this.productsController.getBundleProducts);
        this.router.get(`${this.path}/bundles/:id`, auth_middleware_1.default, this.productsController.getBundleProductById);
        this.router.get(`${this.path}/bundles/:id/value`, auth_middleware_1.default, this.productsController.calculateBundleValue);
        this.router.get(`${this.path}/bundles/:id/availability`, auth_middleware_1.default, this.productsController.validateBundleAvailability);
        this.router.post(`${this.path}`, (req, res, next) => {
            console.error('[UPLOAD DEBUG] POST /products request received', {
                method: req.method,
                url: req.url,
                contentType: req.headers['content-type'],
                contentLength: req.headers['content-length'],
                timestamp: new Date().toISOString()
            });
            next();
        }, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPLOAD_MEDIA)], upload_middleware_1.default, this.productsController.createProduct);
        this.router.post(`${this.path}/:productId/upload-media`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPLOAD_MEDIA)], upload_middleware_1.default, this.productsController.uploadMedia);
        this.router.get(`${this.path}/:productId/download`, auth_middleware_1.default, this.productsController.downloadMedia);
        this.router.put(`${this.path}/:id`, auth_middleware_1.default, (0, validation_middleware_1.default)(products_dto_1.UpdateProductDto, 'body', true), this.productsController.updateProduct);
        this.router.delete(`${this.path}/:id`, auth_middleware_1.default, this.productsController.deleteProduct);
        this.router.patch(`${this.path}/:id/stock`, auth_middleware_1.default, (0, validation_middleware_1.default)({ quantity: 'number' }, 'body'), this.productsController.updateStock);
    }
}
exports.default = ProductsRoute;
//# sourceMappingURL=products.route.js.map