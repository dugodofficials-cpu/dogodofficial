import { Router } from 'express';
import ProductsController from '@backend/products/products.controller';
import { UpdateProductDto } from '@backend/products/products.dto';
import { Routes } from '@backend/interfaces/routes.interface';
import validationMiddleware from '@backend/middlewares/validation.middleware';
import authMiddleware from '@backend/middlewares/auth.middleware';
import multer from 'multer';
import { hasPermission } from '@backend/middlewares/permission.middleware';
import { Permission } from '../roles/roles.interface';
import { HttpException } from '@backend/exceptions/HttpException';
import handleMulterUpload from '@backend/middlewares/upload.middleware';
class ProductsRoute implements Routes {
  public path = '/products';
  public router = Router();
  public productsController = new ProductsController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.productsController.getProducts);
    this.router.get(`${this.path}/active`, authMiddleware, this.productsController.getActiveProducts);
    this.router.get(`${this.path}/search`, authMiddleware, this.productsController.searchProducts);
    this.router.get(`${this.path}/category/:category`, authMiddleware, this.productsController.getProductsByCategory);
    this.router.get(`${this.path}/digital/albums`, authMiddleware, this.productsController.getDigitalProductsByAlbums);
    this.router.get(`${this.path}/:id`, authMiddleware, this.productsController.getProductById);
    this.router.get(`${this.path}/sku/:sku`, authMiddleware, this.productsController.getProductBySku);
    this.router.get(`${this.path}/album/:album`, authMiddleware, this.productsController.getProductsByAlbum);
    this.router.get(`${this.path}/bundles`, authMiddleware, this.productsController.getBundleProducts);
    this.router.get(`${this.path}/bundles/:id`, authMiddleware, this.productsController.getBundleProductById);
    this.router.get(`${this.path}/bundles/:id/value`, authMiddleware, this.productsController.calculateBundleValue);
    this.router.get(`${this.path}/bundles/:id/availability`, authMiddleware, this.productsController.validateBundleAvailability);
    this.router.post(
      `${this.path}/upload-url`,
      [authMiddleware, hasPermission(Permission.UPLOAD_MEDIA)],
      this.productsController.getUploadUrl
    );
    this.router.post(
      `${this.path}`,
      [authMiddleware, hasPermission(Permission.UPLOAD_MEDIA)],
      handleMulterUpload,
      this.productsController.createProduct
    );
    this.router.post(
      `${this.path}/bulk-upload`,
      [authMiddleware, hasPermission(Permission.UPLOAD_MEDIA)],
      handleMulterUpload,
      this.productsController.bulkUploadAlbumTracks
    );
    this.router.post(
      `${this.path}/:productId/upload-media`,
      [authMiddleware, hasPermission(Permission.UPLOAD_MEDIA)],
      handleMulterUpload,
      this.productsController.uploadMedia
    );
    this.router.get(
      `${this.path}/:productId/download`,
      authMiddleware,
      this.productsController.downloadMedia
    );
    this.router.get(
      `${this.path}/:productId/preview`,
      this.productsController.previewMedia
    );
    this.router.put(`${this.path}/:id`, [authMiddleware, hasPermission(Permission.UPDATE_PRODUCT)], validationMiddleware(UpdateProductDto, 'body', true), this.productsController.updateProduct);
    this.router.delete(`${this.path}/:id`, [authMiddleware, hasPermission(Permission.DELETE_PRODUCT)], this.productsController.deleteProduct);
    this.router.patch(`${this.path}/:id/stock`, [authMiddleware, hasPermission(Permission.UPDATE_PRODUCT)], validationMiddleware({ quantity: 'number' }, 'body'), this.productsController.updateStock);
  }
}
export default ProductsRoute;
