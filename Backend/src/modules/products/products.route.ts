import { Router } from 'express';
import ProductsController from '@/modules/products/products.controller';
import { CreateProductDto, UpdateProductDto } from '@/modules/products/products.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import multer from 'multer';
import { hasPermission } from '@/middlewares/permission.middleware';
import { Permission } from '../roles/roles.interface';
import { HttpException } from '@/exceptions/HttpException';
import handleMulterUpload from '@/middlewares/upload.middleware';
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
      `${this.path}`,
      (req, res, next) => {
        console.error('[UPLOAD DEBUG] POST /products request received', {
          method: req.method,
          url: req.url,
          contentType: req.headers['content-type'],
          contentLength: req.headers['content-length'],
          timestamp: new Date().toISOString()
        });
        next();
      },
      [authMiddleware, hasPermission(Permission.UPLOAD_MEDIA)],
      handleMulterUpload,
      this.productsController.createProduct
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
      authMiddleware,
      this.productsController.previewMedia
    );
    this.router.put(`${this.path}/:id`, authMiddleware, validationMiddleware(UpdateProductDto, 'body', true), this.productsController.updateProduct);
    this.router.delete(`${this.path}/:id`, authMiddleware, this.productsController.deleteProduct);
    this.router.patch(`${this.path}/:id/stock`, authMiddleware, validationMiddleware({ quantity: 'number' }, 'body'), this.productsController.updateStock);
  }
}
export default ProductsRoute;