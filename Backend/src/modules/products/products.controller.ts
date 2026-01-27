import { NextFunction, Request, Response } from 'express';
import { CreateProductDto, UpdateProductDto, GetProductsQueryDto, GetDigitalProductsByAlbumsQueryDto, UpdateDigitalDeliveryInfoDto, UpdateEbookDeliveryInfoDto } from '@/modules/products/products.dto';
import { Product, ProductType } from '@/modules/products/products.interface';
import ProductService from '@/modules/products/products.service';
import { RequestWithUser } from '../auth/auth.interface';
import s3PublicService from '@/utils/s3Public';
import s3Service from '@/utils/s3';
import { HttpException } from '@/exceptions/HttpException';
import { cleanupTempFiles } from '@/middlewares/upload.middleware';
import EmailService from '@/modules/email/email.service';
import jobsService from '@/modules/jobs/jobs.service';
import { JobType } from '@/modules/jobs/jobs.interface';
class ProductsController {
  public productService = new ProductService();
  private emailService = new EmailService();
  public getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: GetProductsQueryDto = req.query;
      const products = await this.productService.findAllProducts(query);
      res
        .status(200)
        .json({ data: products.data, meta: { total: products.total, page: products.page, limit: products.limit, totalPages: products.totalPages } });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId: string = req.params.id;
      const findOneProductData: Product = await this.productService.findProductById(productId);
      res.status(200).json({ data: findOneProductData, message: 'findOne' });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public getProductBySku = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sku: string = req.params.sku;
      const findOneProductData: Product = await this.productService.findProductBySku(sku);
      res.status(200).json({ data: findOneProductData, message: 'findOne' });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public createProduct = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productData: CreateProductDto = req.body;
      const createdProduct = await this.productService.createProduct(productData);
      if (req.file && createdProduct.type === ProductType.PHYSICAL) {
        const folder = `products/${createdProduct._id}/media`;
        const { url } = await s3PublicService.uploadPublicFile(req.file, folder);
        const updatedProduct = await this.productService.updateProduct(createdProduct._id.toString(), { images: [url] } as UpdateProductDto);
        res.status(201).json({
          message: 'Product created with media successfully',
          data: {
            product: updatedProduct,
          }
        });
        cleanupTempFiles(req.file);
        return;
      }
      if (req.file && createdProduct.type === ProductType.DIGITAL) {
        const folder = `products/${createdProduct._id}/media`;
        const { key } = await s3Service.uploadFile(req.file, folder);
        const updateData: UpdateDigitalDeliveryInfoDto = {
          digitalDeliveryInfo: {
            ...createdProduct.digitalDeliveryInfo,
            downloadUrl: key
          }
        };
        const updatedProduct = await this.productService.updateDigitalDeliveryInfo(createdProduct._id.toString(), updateData);
        res.status(201).json({
          message: 'Product created with media successfully',
          data: {
            product: updatedProduct,
            downloadEndpoint: `/products/${createdProduct._id}/download`
          }
        });
        cleanupTempFiles(req.file);
        return;
      }
      if (req.files && createdProduct.type === ProductType.EBOOK) {
        const folder = `products/${createdProduct._id}/ebook`;
        const ebookFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
        const productId = createdProduct._id.toString();
        const userEmail = req.user?.email;
        const userFirstName = req.user?.firstName;
        const downloadFile = ebookFiles['downloadUrl']?.[0] || ebookFiles['downloadFile']?.[0];
        const coverFile = ebookFiles['bookCoverArt']?.[0] || ebookFiles['coverImage']?.[0] || ebookFiles['image']?.[0];
        const existingEbookDeliveryInfo = createdProduct.ebookDeliveryInfo;
        const filesForCleanup: Express.Multer.File[] = [];
        if (downloadFile) filesForCleanup.push(downloadFile);
        if (coverFile) filesForCleanup.push(coverFile);
        const downloadFilePath = downloadFile?.path;
        const coverFilePath = coverFile?.path;
        const downloadFileMimetype = downloadFile?.mimetype;
        const coverFileMimetype = coverFile?.mimetype;
        const downloadFileOriginalName = downloadFile?.originalname;
        const coverFileOriginalName = coverFile?.originalname;
        const job = await jobsService.createJob(JobType.EBOOK_UPLOAD, {
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
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId: string = req.params.id;
      const productData: UpdateProductDto = req.body;
      const updateProductData: Product = await this.productService.updateProduct(productId, productData);
      res.status(200).json({ data: updateProductData, message: 'updated' });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId: string = req.params.id;
      const deleteProductData: Product = await this.productService.deleteProduct(productId);
      res.status(200).json({ data: deleteProductData, message: 'deleted' });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public updateStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId: string = req.params.id;
      const { quantity } = req.body;
      const updateStockData: Product = await this.productService.updateStock(productId, quantity);
      res.status(200).json({ data: updateStockData, message: 'stock updated' });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.query;
      const searchResults: Product[] = await this.productService.searchProducts(query as string);
      res.status(200).json({ data: searchResults, message: 'search results' });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const products: Product[] = await this.productService.getProductsByCategory(category);
      res.status(200).json({ data: products, message: 'category products' });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public getActiveProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products: Product[] = await this.productService.getActiveProducts();
      res.status(200).json({ data: products, message: 'active products' });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public getBundleProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bundleProducts: Product[] = await this.productService.getBundleProducts();
      res.status(200).json({ data: bundleProducts, message: 'bundle products' });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public getBundleProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bundleId: string = req.params.id;
      const bundleProduct: Product = await this.productService.getBundleProductById(bundleId);
      res.status(200).json({ data: bundleProduct, message: 'bundle product found' });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public calculateBundleValue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bundleId: string = req.params.id;
      const valueCalculation = await this.productService.calculateBundleValue(bundleId);
      res.status(200).json({
        data: valueCalculation,
        message: 'bundle value calculated',
        currency: 'NGN'
      });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public validateBundleAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bundleId: string = req.params.id;
      const availability = await this.productService.validateBundleAvailability(bundleId);
      res.status(200).json({
        data: availability,
        message: availability.available ? 'bundle is available' : 'bundle has unavailable items'
      });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public getProductsByAlbum = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const album = req.params.album;
      const query: GetProductsQueryDto = req.query;
      const products = await this.productService.findProductsByAlbum(album, query, req.user._id.toString());
      res
        .status(200)
        .json({ data: products.data, meta: { total: products.total, page: products.page, limit: products.limit, totalPages: products.totalPages } });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public getDigitalProductsByAlbums = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const query: GetDigitalProductsByAlbumsQueryDto = req.query;
      const result = await this.productService.findDigitalProductsByAlbums(query, req.user._id.toString());
      res.status(200).json(result);
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public uploadMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      if (product.type === ProductType.DIGITAL) {
        if (!req.file) {
          res.status(400).json({ message: 'No file uploaded' });
          return;
        }
        const file = req.file;
        const folder = `products/${productId}/media`;
        const { key } = await s3Service.uploadFile(file, folder);
        const updateData: UpdateDigitalDeliveryInfoDto = {
          digitalDeliveryInfo: {
            ...product.digitalDeliveryInfo,
            downloadUrl: key
          }
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
        cleanupTempFiles(req.file);
        return;
      }
      if (product.type === ProductType.EBOOK) {
        const folder = `products/${productId}/ebook`;
        const ebookFiles = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
        const singleFile = req.file;
        let downloadUrl: string | undefined;
        let bookCoverArt: string | undefined;
        const downloadFile = ebookFiles['downloadUrl']?.[0] || ebookFiles['downloadFile']?.[0] ||
          (singleFile && !singleFile.mimetype.startsWith('image/') ? singleFile : null);
        if (downloadFile) {
          const { key } = await s3Service.uploadFile(downloadFile, `${folder}/download`);
          downloadUrl = key;
        }
        const coverFile = ebookFiles['bookCoverArt']?.[0] || ebookFiles['coverImage']?.[0] || ebookFiles['image']?.[0] ||
          (singleFile && singleFile.mimetype.startsWith('image/') ? singleFile : null);
        if (coverFile) {
          const { url } = await s3PublicService.uploadPublicFile(coverFile, `${folder}/cover`);
          bookCoverArt = url;
        }
        if (!downloadUrl && !bookCoverArt) {
          res.status(400).json({ message: 'No valid ebook file or cover image uploaded' });
          return;
        }
        const updateData: UpdateEbookDeliveryInfoDto = {
          ebookDeliveryInfo: {
            ...product.ebookDeliveryInfo,
            ...(downloadUrl && { downloadUrl }),
            ...(bookCoverArt && { bookCoverArt })
          }
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
        cleanupTempFiles(req.files);
        cleanupTempFiles(req.file);
        return;
      }
      throw new HttpException(400, 'Media can only be uploaded for digital or ebook products');
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
  public downloadMedia = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = req.params.productId;
      const userId = req.user._id.toString();
      const product = await this.productService.findProductById(productId);
      let downloadUrl: string | undefined;
      if (product.type === ProductType.DIGITAL && product.digitalDeliveryInfo?.downloadUrl) {
        downloadUrl = product.digitalDeliveryInfo.downloadUrl;
      }
      else if (product.type === ProductType.EBOOK && product.ebookDeliveryInfo?.downloadUrl) {
        downloadUrl = product.ebookDeliveryInfo.downloadUrl;
      }
      if (!downloadUrl) {
        throw new HttpException(404, 'Download not available');
      }
      const hasAccess = await this.productService.verifyUserProductAccess(userId, productId);
      if (!hasAccess) {
        throw new HttpException(403, 'You do not have access to this download');
      }
      const signedUrl = await s3Service.getSignedUrl(downloadUrl);
      res.status(200).json({
        message: 'Download URL generated successfully',
        data: {
          url: signedUrl,
          expiresIn: 604800
        }
      });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };
}
export default ProductsController;