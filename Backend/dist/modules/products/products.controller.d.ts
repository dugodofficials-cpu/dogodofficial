import { NextFunction, Request, Response } from 'express';
import ProductService from '../../modules/products/products.service';
import { RequestWithUser } from '../auth/auth.interface';
declare class ProductsController {
    productService: ProductService;
    private emailService;
    getProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProductById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProductBySku: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createProduct: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    updateProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateStock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    searchProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProductsByCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getActiveProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBundleProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBundleProductById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    calculateBundleValue: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    validateBundleAvailability: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProductsByAlbum: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    getDigitalProductsByAlbums: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    uploadMedia: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    downloadMedia: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
}
export default ProductsController;
