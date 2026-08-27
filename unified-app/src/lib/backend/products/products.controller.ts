import { NextFunction, Request, Response } from 'express';
import { CreateProductDto, UpdateProductDto, GetProductsQueryDto, GetDigitalProductsByAlbumsQueryDto, UpdateDigitalDeliveryInfoDto, UpdateEbookDeliveryInfoDto } from '@backend/products/products.dto';
import { Product, ProductStatus, ProductType } from '@backend/products/products.interface';
import ProductService from '@backend/products/products.service';
import { RequestWithUser } from '../auth/auth.interface';
import s3PublicService from '@backend/utils/s3Public';
import s3Service from '@backend/utils/s3';
import { HttpException } from '@backend/exceptions/HttpException';
import { cleanupTempFiles } from '@backend/middlewares/upload.middleware';
import EmailService from '@backend/email/email.service';
import jobsService from '@backend/jobs/jobs.service';
import { JobType } from '@backend/jobs/jobs.interface';
import { AlbumCoverModel } from '@backend/album-covers/album-covers.model';
import RoleService from '@backend/roles/roles.service';
import { Permission } from '@backend/roles/roles.interface';
const roleService = new RoleService();
const UPLOAD_KINDS: Record<string, { contentTypes: string[]; folder: string; maxBytes: number }> = {
  image: {
    contentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    folder: 'products/covers',
    maxBytes: 10 * 1024 * 1024, // 10MB — generous for a cover photo, not a raw video dump
  },
  ebook: {
    contentTypes: ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook', 'application/vnd.amazon.ebook'],
    folder: 'products/ebooks',
    maxBytes: 200 * 1024 * 1024, // 200MB — a real EPUB/PDF with embedded art can be sizeable
  },
  audio: {
    contentTypes: [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/flac',
      'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg',
    ],
    folder: 'products/media',
    maxBytes: 300 * 1024 * 1024, // 300MB — lossless masters run large
  },
};

class ProductsController {
  public productService = new ProductService();
  private emailService = new EmailService();
  private readonly skuFallbackPrefix = 'ALBUM';
  // Product files (cover images, ebook files, audio) upload directly to
  // storage from the browser via a presigned URL, instead of through this
  // Vercel function — see s3Public.ts's getPresignedUploadUrl for why (the
  // function's request body is capped around 4.5MB by the platform itself,
  // which a real photo, let alone an ebook or audio file, can easily exceed
  // regardless of multer's own, much larger, limit).
  public getUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filename, contentType, sizeBytes } = req.body || {};
      if (!filename || typeof filename !== 'string') {
        throw new HttpException(400, 'filename is required');
      }
      const kind = Object.values(UPLOAD_KINDS).find(k => k.contentTypes.includes(contentType));
      if (!kind) {
        throw new HttpException(400, 'Unsupported contentType for direct upload');
      }
      if (typeof sizeBytes === 'number' && sizeBytes > kind.maxBytes) {
        throw new HttpException(400, `File must be under ${kind.maxBytes / (1024 * 1024)}MB`);
      }
      const safeName = filename.toString().replace(/[^a-zA-Z0-9_.-]/g, '_').slice(-120);
      const key = `${kind.folder}/${Date.now()}-${safeName}`;
      const uploadUrl = await s3PublicService.getPresignedUploadUrl(key, contentType);
      res.status(200).json({ data: { key, uploadUrl }, message: 'upload url generated' });
    } catch (error) {
      next(error);
    }
  };
  // A generic product read response (list/detail/search/browse) must never
  // include the actual downloadable file location — that's only handed out
  // by the dedicated, ownership-checked /products/:id/download endpoint.
  // Admins (READ_PRODUCT) still see it, since the admin UI needs it.
  private async canReadPrivateProductFields(req: Request): Promise<boolean> {
    const userId = (req as RequestWithUser).user?._id?.toString();
    if (!userId) return false;
    return roleService.hasPermission({ userId, permission: Permission.READ_PRODUCT });
  }
  private stripPrivateDeliveryFields = <T>(product: T): T => {
    const plain: any = typeof (product as any)?.toObject === 'function' ? (product as any).toObject() : { ...(product as any) };
    if (plain?.digitalDeliveryInfo) {
      const { downloadUrl, ...rest } = plain.digitalDeliveryInfo;
      plain.digitalDeliveryInfo = rest;
    }
    if (plain?.ebookDeliveryInfo) {
      const { downloadUrl, ...rest } = plain.ebookDeliveryInfo;
      plain.ebookDeliveryInfo = rest;
    }
    return plain;
  };
  private sanitizeProducts = async (req: Request, products: any) => {
    if (await this.canReadPrivateProductFields(req)) return products;
    return Array.isArray(products) ? products.map(this.stripPrivateDeliveryFields) : this.stripPrivateDeliveryFields(products);
  };
  public getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: GetProductsQueryDto = req.query;
      const products = await this.productService.findAllProducts(query);
      const data = await this.sanitizeProducts(req, products.data);
      res
        .status(200)
        .json({ data, meta: { total: products.total, page: products.page, limit: products.limit, totalPages: products.totalPages } });
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
      res.status(200).json({ data: await this.sanitizeProducts(req, findOneProductData), message: 'findOne' });
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
      res.status(200).json({ data: await this.sanitizeProducts(req, findOneProductData), message: 'findOne' });
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
        const { key } = await s3PublicService.uploadPublicFile(req.file, folder);
        const updatedProduct = await this.productService.updateProduct(createdProduct._id.toString(), { images: [key] } as UpdateProductDto);
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
        if (!updatedProduct.previewUrl) {
          await this.productService.updateProduct(updatedProduct._id.toString(), { previewUrl: key } as UpdateProductDto);
        }
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
      res.status(200).json({ data: await this.sanitizeProducts(req, searchResults), message: 'search results' });
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
      res.status(200).json({ data: await this.sanitizeProducts(req, products), message: 'category products' });
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
      res.status(200).json({ data: await this.sanitizeProducts(req, products), message: 'active products' });
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
      res.status(200).json({ data: await this.sanitizeProducts(req, bundleProducts), message: 'bundle products' });
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
      res.status(200).json({ data: await this.sanitizeProducts(req, bundleProduct), message: 'bundle product found' });
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
      const data = await this.sanitizeProducts(req, products.data);
      res
        .status(200)
        .json({ data, meta: { total: products.total, page: products.page, limit: products.limit, totalPages: products.totalPages } });
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

  public bulkUploadAlbumTracks = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Two ways a track's audio can reach this endpoint:
      // 1. Legacy: raw multipart files under "audios" — a real request body
      //    with every track's bytes in it, which is exactly what 413s on
      //    Vercel once the folder is more than a track or two.
      // 2. Direct upload: the browser already PUT each file straight to
      //    storage via a presigned URL (see getUploadUrl), and this request
      //    just carries the resulting {key, fileName, duration} per track —
      //    small JSON regardless of how many tracks or how large they are.
      const allFiles = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const uploadedAudioFiles = (allFiles?.audios || []).filter(file => file.mimetype.startsWith('audio/'));
      const preUploadedTracks = Array.isArray(req.body?.tracks)
        ? (req.body.tracks as Array<{ key: string; fileName: string; duration?: string }>)
        : [];

      if (!uploadedAudioFiles.length && !preUploadedTracks.length) {
        throw new HttpException(400, 'No audio files uploaded. Use the "audios" field, or a "tracks" array of pre-uploaded { key, fileName }.');
      }

      type TrackSource = { fileName: string; duration?: string; resolveKey: (folder: string) => Promise<string> };
      const sources: TrackSource[] = uploadedAudioFiles.length
        ? uploadedAudioFiles.map(file => ({
            fileName: file.originalname || file.filename,
            resolveKey: async (folder: string) => (await s3Service.uploadFile(file, folder)).key,
          }))
        : preUploadedTracks.map(track => ({
            fileName: track.fileName,
            duration: track.duration,
            resolveKey: async () => track.key,
          }));

      const albumId = (req.body?.albumId || '').toString().trim();
      if (!albumId) {
        throw new HttpException(400, 'albumId is required');
      }

      const albumCover = await AlbumCoverModel.findById(albumId);
      if (!albumCover) {
        throw new HttpException(404, 'Album cover not found for the provided albumId');
      }

      const categories = this.parseCsvField(req.body?.categories);
      if (!categories.length) {
        throw new HttpException(400, 'At least one category is required');
      }

      const tags = this.parseCsvField(req.body?.tags);
      const price = Number(req.body?.price);
      if (!Number.isFinite(price) || price < 0) {
        throw new HttpException(400, 'price must be a valid non-negative number');
      }

      const albumPriceRaw = req.body?.albumPrice;
      const albumPrice = albumPriceRaw === undefined || albumPriceRaw === ''
        ? price
        : Number(albumPriceRaw);
      if (!Number.isFinite(albumPrice) || albumPrice < 0) {
        throw new HttpException(400, 'albumPrice must be a valid non-negative number');
      }

      const startOrder = Number(req.body?.startOrder ?? 1);
      const initialOrder = Number.isFinite(startOrder) ? Math.max(0, Math.floor(startOrder)) : 1;

      const statusRaw = (req.body?.status || ProductStatus.DRAFT).toString().toUpperCase();
      const status = Object.values(ProductStatus).includes(statusRaw as ProductStatus)
        ? (statusRaw as ProductStatus)
        : ProductStatus.DRAFT;

      const isActive = this.parseBooleanField(req.body?.isActive, true);
      const duration = (req.body?.duration || '').toString().trim();
      const durationsByFile = this.parseDurationMap(req.body?.durationsByFile);
      const descriptionTemplate = (req.body?.description || '').toString().trim();
      const skuPrefix = this.buildSkuPrefix(req.body?.skuPrefix?.toString(), albumCover.title);

      const sortedSources = [...sources].sort((a, b) =>
        a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' }),
      );

      const created: Array<{ id: string; name: string; sku: string; order: number }> = [];
      const failed: Array<{ fileName: string; reason: string }> = [];

      for (const [index, source] of sortedSources.entries()) {
        const trackName = this.extractTrackName(source.fileName);
        const order = initialOrder + index;
        const trackDuration =
          source.duration ||
          durationsByFile[source.fileName] ||
          durationsByFile[this.getBaseName(source.fileName)] ||
          duration;

        try {
          const skuBase = `${skuPrefix}-${String(order).padStart(3, '0')}`;
          const sku = await this.ensureUniqueSku(skuBase);

          const productData: CreateProductDto = {
            name: trackName,
            order,
            album: albumCover.title || 'Unknown Album',
            albumPrice,
            duration: trackDuration,
            description: descriptionTemplate || `Track from ${albumCover.title || 'album'}`,
            sku,
            price,
            type: ProductType.DIGITAL,
            status,
            categories,
            tags,
            images: albumCover.imageUrl ? [albumCover.imageUrl] : [],
            color: '',
            albumId: albumCover.id,
            isActive,
          };

          const createdProduct = await this.productService.createProduct(productData);
          const folder = `products/${createdProduct._id}/media`;
          const key = await source.resolveKey(folder);

          const updateData: UpdateDigitalDeliveryInfoDto = {
            digitalDeliveryInfo: {
              ...createdProduct.digitalDeliveryInfo,
              downloadUrl: key,
            },
          };

          const updatedProduct = await this.productService.updateDigitalDeliveryInfo(createdProduct._id.toString(), updateData);
          if (!updatedProduct.previewUrl) {
            await this.productService.updateProduct(updatedProduct._id.toString(), { previewUrl: key } as UpdateProductDto);
          }

          created.push({
            id: createdProduct._id.toString(),
            name: createdProduct.name,
            sku: createdProduct.sku,
            order: createdProduct.order || order,
          });
        } catch (error) {
          failed.push({
            fileName: source.fileName,
            reason: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      res.status(201).json({
        message: failed.length
          ? `Uploaded ${created.length}/${sortedSources.length} tracks.`
          : `Uploaded ${created.length} tracks successfully.`,
        data: {
          albumId: albumCover.id,
          albumTitle: albumCover.title,
          totalReceived: sortedSources.length,
          createdCount: created.length,
          failedCount: failed.length,
          created,
          failed,
        },
      });
    } catch (error) {
      next(error);
    } finally {
      cleanupTempFiles(req.files);
      cleanupTempFiles(req.file);
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
        if (!updatedProduct.previewUrl) {
          await this.productService.updateProduct(productId, { previewUrl: key } as UpdateProductDto);
        }
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
          const { key } = await s3PublicService.uploadPublicFile(coverFile, `${folder}/cover`);
          bookCoverArt = key;
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

  public previewMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = req.params.productId;
      const product = await this.productService.findProductById(productId);

      const previewKey =
        product.previewUrl ||
        (product.type === ProductType.DIGITAL ? product.digitalDeliveryInfo?.downloadUrl : undefined);

      if (!previewKey) {
        throw new HttpException(404, 'Preview not available');
      }

      // NOTE: there is no separate short preview clip generated anywhere in
      // this codebase — `previewKey` is the exact same file as the full
      // purchasable download, and this endpoint is intentionally
      // unauthenticated so guests can sample a track before buying. The
      // client-side player caps playback at 15s, but that's not enforced
      // here, so a direct call to this endpoint can fetch the complete file.
      // Until real audio-clip generation exists, the only bounded mitigation
      // available here is a short signed-URL lifetime (was previously
      // defaulting to 7 days while claiming 1 hour) so the link can't be
      // bookmarked/shared long-term.
      const expiresIn = 3600;
      const signedUrl = await s3Service.getSignedUrl(previewKey, expiresIn);

      res.status(200).json({
        message: 'Preview URL generated successfully',
        data: {
          url: signedUrl,
          expiresIn,
        },
      });
    } catch (error) {
      console.error('Create Product Error:', error);
      if (req.file) cleanupTempFiles(req.file);
      if (req.files) cleanupTempFiles(req.files);
      next(error);
    }
  };

  private parseCsvField(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map(item => item?.toString().trim())
        .filter(Boolean);
    }

    if (!value) return [];

    return value
      .toString()
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  private parseBooleanField(value: unknown, fallback: boolean): boolean {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    const normalized = value.toString().trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    return fallback;
  }

  private buildSkuPrefix(rawPrefix: string | undefined, albumTitle: string): string {
    const source = (rawPrefix || albumTitle || this.skuFallbackPrefix).toString();
    const normalized = source.replace(/[^a-zA-Z0-9]+/g, '').toUpperCase();
    return normalized.slice(0, 16) || this.skuFallbackPrefix;
  }

  private extractTrackName(fileName: string): string {
    const normalizedPath = fileName.replace(/\\/g, '/');
    const baseName = normalizedPath.split('/').pop() || normalizedPath;
    const withoutExtension = baseName.replace(/\.[^/.]+$/, '');
    return withoutExtension
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Untitled Track';
  }

  private getBaseName(fileName: string): string {
    const normalizedPath = fileName.replace(/\\/g, '/');
    return normalizedPath.split('/').pop() || normalizedPath;
  }

  private parseDurationMap(rawValue: unknown): Record<string, string> {
    if (!rawValue || typeof rawValue !== 'string') return {};

    try {
      const parsed = JSON.parse(rawValue);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

      const durationMap: Record<string, string> = {};
      for (const [rawKey, rawDuration] of Object.entries(parsed)) {
        const key = (rawKey || '').toString().trim();
        const normalizedDuration = this.normalizeDuration((rawDuration || '').toString());
        if (!key || !normalizedDuration) continue;
        durationMap[key] = normalizedDuration;
      }
      return durationMap;
    } catch {
      return {};
    }
  }

  private normalizeDuration(rawDuration: string): string | null {
    const duration = rawDuration.trim();
    if (!duration) return null;

    // Support mm:ss and hh:mm:ss formats.
    if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(duration)) return null;

    const segments = duration.split(':').map(Number);
    if (segments.some(Number.isNaN)) return null;

    if (segments.length === 2) {
      const [minutes, seconds] = segments;
      if (seconds > 59) return null;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    const [hours, minutes, seconds] = segments;
    if (minutes > 59 || seconds > 59) return null;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private async ensureUniqueSku(baseSku: string): Promise<string> {
    let candidate = baseSku.toUpperCase();
    let attempt = 1;
    while (true) {
      const existing = await this.productService.products.findOne({ sku: candidate }).select('_id');
      if (!existing) return candidate;
      candidate = `${baseSku.toUpperCase()}-${attempt}`;
      attempt += 1;
    }
  }
}
export default ProductsController;
