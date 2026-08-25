import { CreateProductDto, UpdateProductDto, UpdateDigitalDeliveryInfoDto, UpdateEbookDeliveryInfoDto } from '@backend/products/products.dto';
import { HttpException } from '@backend/exceptions/HttpException';
import { Product, ProductType, ProductStatus } from '@backend/products/products.interface';
import productModel from '@backend/products/products.model';
import orderModel from '@backend/orders/orders.model';
import { OrderStatus } from '@backend/orders/orders.interface';
import { PaymentStatus } from '@backend/payments/payments.interface';
import { isEmpty, escapeRegex } from '@backend/utils/util';
import { GetProductsQueryDto, GetDigitalProductsByAlbumsQueryDto } from './products.dto';
import { logger } from '@backend/utils/logger';
import { AlbumCoverModel } from '@backend/album-covers/album-covers.model';
interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number | null;
  totalPages: number;
}
interface PaginatedAlbums {
  data: {
    album: string;
    coverImage: string | null;
    totalTracks: number;
    products: Product[];
  }[];
  meta: {
    totalAlbums: number;
    totalTracks: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
class ProductService {
  public products = productModel;
  public async findAllProducts(query: GetProductsQueryDto, isAdmin: boolean = false): Promise<PaginatedProducts> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      category,
      tag,
      minPrice,
      maxPrice,
      isActive,
      exclude,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeBundleItems = false,
    } = query;
    const filter: any = {};
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { sku: { $regex: safeSearch, $options: 'i' } },
        { album: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    if (type) filter.type = includeBundleItems ? { $in: [type, ProductType.BUNDLE, ProductType.EBOOK] } : type === ProductType.PHYSICAL ? { $in: [type, ProductType.EBOOK] } : type;
    if (status) filter.status = status;
    if (category) {
      const categories = category.includes(',') ? category.split(',').map(c => c.trim()) : [category];
      filter.categories = { $in: categories };
    }
    if (tag) filter.tags = tag;
    if (isActive !== undefined) filter.isActive = isActive;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    if (exclude) {
      filter._id = { $ne: exclude };
    }
    const sort: any = {
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
  public async findProductById(productId: string): Promise<Product> {
    if (isEmpty(productId)) throw new HttpException(400, 'ProductId is empty');
    const findProduct = await this.products.findOne({ _id: productId }).populate('albumId');
    if (!findProduct) throw new HttpException(409, "Product doesn't exist");
    return findProduct;
  }
  public async findProductBySku(sku: string): Promise<Product> {
    if (isEmpty(sku)) throw new HttpException(400, 'SKU is empty');
    const findProduct = await this.products.findOne({ sku: sku.toUpperCase() }).populate('albumId');
    if (!findProduct) throw new HttpException(409, "Product doesn't exist");
    return findProduct;
  }
  public async createProduct(productData: CreateProductDto): Promise<Product> {
    if (isEmpty(productData)) throw new HttpException(400, 'productData is empty');
    const findProduct = await this.products.findOne({ sku: productData.sku.toUpperCase() });
    if (findProduct) throw new HttpException(409, `Product with SKU ${productData.sku} already exists`);
    if (productData.type === ProductType.PHYSICAL) {
      if (productData.stockQuantity === undefined) {
        throw new HttpException(400, 'Physical products require stock quantity');
      }
    } else if (productData.type === ProductType.DIGITAL) {
    } else if (productData.type === ProductType.EBOOK) {
    } else if (productData.type === ProductType.BUNDLE) {
      if (!productData.bundleItems || productData.bundleItems.length === 0) {
        throw new HttpException(400, 'Bundle products require at least one bundle item');
      }
      if (!productData.bundlePrice || productData.bundlePrice <= 0) {
        throw new HttpException(400, 'Bundle products require a valid bundle price');
      }
      for (const item of productData.bundleItems) {
        if (!item.title || item.title.trim() === '') {
          throw new HttpException(400, 'Bundle items must have a title');
        }
        if (item.productId === '' || item.productId === null) {
          item.productId = undefined;
        }
        if (item.productId) {
          const referencedProduct = await this.products.findById(item.productId);
          if (!referencedProduct) {
            throw new HttpException(400, `Bundle item references non-existent product: ${item.productId}`);
          }
          if (referencedProduct.type === ProductType.BUNDLE) {
            throw new HttpException(400, 'Bundle products cannot contain other bundle products');
          }
        }
      }
      if (productData.minItems && productData.maxItems && productData.minItems > productData.maxItems) {
        throw new HttpException(400, 'minItems cannot be greater than maxItems');
      }
    }
    const createProductData: Product = await this.products.create({
      ...productData,
      sku: productData.sku.toUpperCase(),
      status: productData.status || ProductStatus.DRAFT,
    });
    return (await this.products.findById(createProductData._id).populate('albumId'))!;
  }
  public async updateProduct(productId: string, productData: UpdateProductDto): Promise<Product> {
    if (isEmpty(productData)) throw new HttpException(400, 'productData is empty');
    if (productData.sku) {
      const findProduct = await this.products.findOne({ sku: productData.sku.toUpperCase() });
      if (findProduct && findProduct._id != productId) {
        throw new HttpException(409, `Product with SKU ${productData.sku} already exists`);
      }
      productData.sku = productData.sku.toUpperCase();
    }
    const currentProduct = await this.findProductById(productId);
    if (productData.type && productData.type !== currentProduct.type) {
      if (productData.type === ProductType.PHYSICAL) {
        if (!productData.dimensions) {
          throw new HttpException(400, 'Physical products require dimensions');
        }
        if (productData.stockQuantity === undefined) {
          throw new HttpException(400, 'Physical products require stock quantity');
        }
      } else if (productData.type === ProductType.DIGITAL) {
      } else if (productData.type === ProductType.EBOOK) {
      } else if (productData.type === ProductType.BUNDLE) {
        if (!productData.bundleItems || productData.bundleItems.length === 0) {
          throw new HttpException(400, 'Bundle products require at least one bundle item');
        }
        if (!productData.bundlePrice || productData.bundlePrice <= 0) {
          throw new HttpException(400, 'Bundle products require a valid bundle price');
        }
        for (const item of productData.bundleItems) {
          if (!item.title || item.title.trim() === '') {
            throw new HttpException(400, 'Bundle items must have a title');
          }
          if (item.productId === '' || item.productId === null) {
            item.productId = undefined;
          }
          if (item.productId) {
            const referencedProduct = await this.products.findById(item.productId);
            if (!referencedProduct) {
              throw new HttpException(400, `Bundle item references non-existent product: ${item.productId}`);
            }
            if (referencedProduct.type === ProductType.BUNDLE) {
              throw new HttpException(400, 'Bundle products cannot contain other bundle products');
            }
          }
        }
        if (productData.minItems && productData.maxItems && productData.minItems > productData.maxItems) {
          throw new HttpException(400, 'minItems cannot be greater than maxItems');
        }
      }
    }
    const updateProductById = await this.products.findByIdAndUpdate(productId, productData, { new: true }).populate('albumId');
    if (!updateProductById) throw new HttpException(409, "Product doesn't exist");
    return updateProductById;
  }
  public async deleteProduct(productId: string): Promise<Product> {
    const deleteProductById = await this.products.findByIdAndDelete(productId);
    if (!deleteProductById) throw new HttpException(409, "Product doesn't exist");
    return deleteProductById;
  }
  public async updateStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findProductById(productId);
    if (product.type !== ProductType.PHYSICAL) {
      throw new HttpException(400, 'Cannot update stock for non-physical products');
    }
    if ((product.stockQuantity ?? 0) + quantity < 0) {
      throw new HttpException(400, 'Insufficient stock');
    }
    const updatedProduct = (await this.products.findByIdAndUpdate(
      productId,
      {
        $inc: { stockQuantity: quantity },
        $set: {
          status: (product.stockQuantity ?? 0) + quantity === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE,
        },
      },
      { new: true },
    ))!;
    if ((updatedProduct.stockQuantity ?? 0) <= (updatedProduct.lowStockThreshold ?? 0)) {
      logger.info(`Low stock alert for product ${updatedProduct.sku}`);
    }
    return updatedProduct;
  }
  public async searchProducts(query: string): Promise<Product[]> {
    return this.products.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } }).sort({ order: 1, score: { $meta: 'textScore' } }).populate('albumId');
  }
  public async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.find({ categories: category }).sort({ order: 1 }).populate('albumId');
  }
  public async getActiveProducts(): Promise<Product[]> {
    return this.products.find({
      status: ProductStatus.ACTIVE,
      isActive: true,
    }).sort({ order: 1 }).populate('albumId');
  }
  public async findProductsByAlbum(album: string, query: GetProductsQueryDto, userId: string): Promise<PaginatedProducts> {
    const { page = 1, limit = null, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    let albumCover = await AlbumCoverModel.findOne({ title: album });;
    let skip: number = 0;
    if (limit === null) {
      skip = 0;
    } else {
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
    const filter: any = {
      albumId: albumCover._id,
      status: ProductStatus.ACTIVE,
    };
    const sort: any = {
      order: 1,
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    };
    const [products, total] = await Promise.all([
      this.products.find(filter).sort(sort).skip(skip).limit(limit === null ? 0 : limit).populate('albumId'),
      this.products.countDocuments(filter),
    ]);
    const userOrders = await orderModel.find({
      user: userId,
      status: { $nin: [OrderStatus.CANCELLED, OrderStatus.PENDING] },
      'items.product': { $in: products.map(p => p._id) }
    }).select('items.product');
    const purchasedProductIds = new Set(
      userOrders.flatMap(order =>
        order.items.map(item => item.product.toString())
      )
    );
    const processedProducts = products.map(product => {
      const productCopy = product.toObject() as Product;
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
  public async findDigitalProductsByAlbums(query: GetDigitalProductsByAlbumsQueryDto, userId: string): Promise<PaginatedAlbums> {
    const { page = 1, limit = 10, search, minPrice, maxPrice, sortBy = 'album', sortOrder = 'asc' } = query;
    const albumCoverFilter: any = {};
    if (search) {
      const safeSearch = escapeRegex(search);
      albumCoverFilter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    const albumSort: any = {};
    if (sortBy === 'album') {
      albumSort.title = sortOrder === 'asc' ? 1 : -1;
    } else {
      albumSort.createdAt = sortOrder === 'asc' ? 1 : -1;
    }
    const skip = (page - 1) * limit;
    const totalAlbums = await AlbumCoverModel.countDocuments(albumCoverFilter);
    const albumCovers = await AlbumCoverModel.find(albumCoverFilter)
      .sort(albumSort)
      .skip(skip)
      .limit(limit);
    const albumIds = albumCovers.map(cover => cover._id);
    const productsFilter: any = {
      type: ProductType.DIGITAL,
      isActive: true,
      status: ProductStatus.ACTIVE,
      albumId: { $in: albumIds },
    };
    if (minPrice !== undefined || maxPrice !== undefined) {
      productsFilter.price = {};
      if (minPrice !== undefined) productsFilter.price.$gte = minPrice;
      if (maxPrice !== undefined) productsFilter.price.$lte = maxPrice;
    }
    if (search) {
      const safeSearch = escapeRegex(search);
      productsFilter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { album: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    const productSort: any = {
      order: 1,
    };
    if (sortBy === 'album') {
      productSort.name = 1;
    } else {
      productSort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }
    const products = await this.products.find(productsFilter).sort(productSort);
    const userOrders = await orderModel.find({
      user: userId,
      status: { $nin: [OrderStatus.CANCELLED, OrderStatus.PENDING] },
      'items.product': { $in: products.map(p => p._id) }
    }).select('items.product');
    const purchasedProductIds = new Set(
      userOrders.flatMap(order =>
        order.items.map(item => item.product.toString())
      )
    );
    const productsByAlbumId = products.reduce((acc, product) => {
      const albumId: any = product.albumId;
      if (!albumId) return acc;
      const albumIdStr = typeof albumId === 'object' && albumId !== null && albumId._id
        ? albumId._id.toString()
        : String(albumId);
      if (!acc[albumIdStr]) {
        acc[albumIdStr] = [];
      }
      const productCopy = product.toObject() as Product;
      if (!purchasedProductIds.has(product._id.toString())) {
        delete productCopy.digitalDeliveryInfo;
      }
      acc[albumIdStr].push(productCopy);
      return acc;
    }, {} as { [albumId: string]: Product[] });
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
  public async verifyUserProductAccess(userId: string, productId: string): Promise<boolean> {
    const order = await orderModel.findOne({
      user: userId,
      'items.product': productId,
      status: { $nin: [OrderStatus.CANCELLED, OrderStatus.DELETED] },
      $or: [
        { status: { $ne: OrderStatus.PENDING } },
        { paymentStatus: PaymentStatus.COMPLETED },
      ],
    });

    return !!order;
  }
  public async updateDigitalDeliveryInfo(productId: string, updateData: UpdateDigitalDeliveryInfoDto): Promise<Product> {
    const product = await this.findProductById(productId);
    if (product.type !== ProductType.DIGITAL) {
      throw new HttpException(400, 'Digital delivery info can only be updated for digital products');
    }
    const updateProductById = await this.products.findByIdAndUpdate(
      productId,
      { digitalDeliveryInfo: updateData.digitalDeliveryInfo },
      { new: true }
    ).populate('albumId');
    if (!updateProductById) throw new HttpException(409, "Product doesn't exist");
    return updateProductById;
  }
  public async updateEbookDeliveryInfo(productId: string, updateData: UpdateEbookDeliveryInfoDto): Promise<Product> {
    const product = await this.findProductById(productId);
    if (product.type !== ProductType.EBOOK) {
      throw new HttpException(400, 'Ebook delivery info can only be updated for ebook products');
    }
    const updateObject: any = {
      ebookDeliveryInfo: updateData.ebookDeliveryInfo
    };
    if (updateData.ebookDeliveryInfo?.bookCoverArt) {
      const existingImages = product.images || [];
      if (!existingImages.includes(updateData.ebookDeliveryInfo.bookCoverArt)) {
        updateObject.images = [...existingImages, updateData.ebookDeliveryInfo.bookCoverArt];
      }
    }
    const updateProductById = await this.products.findByIdAndUpdate(
      productId,
      updateObject,
      { new: true }
    ).populate('albumId');
    if (!updateProductById) throw new HttpException(409, "Product doesn't exist");
    return updateProductById;
  }
  public async getBundleProducts(): Promise<Product[]> {
    return this.products.find({
      type: ProductType.BUNDLE,
      isActive: true,
      status: ProductStatus.ACTIVE,
    }).sort({ order: 1 }).populate('bundleItems.productId').populate('albumId');
  }
  public async getBundleProductById(bundleId: string): Promise<Product> {
    const bundle = await this.products.findById(bundleId)
      .populate('bundleItems.productId')
      .populate('bundleItems.productId.dimensions')
      .populate('bundleItems.productId.digitalDeliveryInfo')
      .populate('albumId');
    if (!bundle) {
      throw new HttpException(404, 'Bundle product not found');
    }
    if (bundle.type !== ProductType.BUNDLE) {
      throw new HttpException(400, 'Product is not a bundle');
    }
    return bundle;
  }
  public async calculateBundleValue(bundleId: string): Promise<{ totalValue: number; bundlePrice: number; savings: number }> {
    const bundle = await this.getBundleProductById(bundleId);
    let totalValue = 0;
    for (const item of bundle.bundleItems ?? []) {
      if (item.productId) {
        const product = item.productId as any;
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
  public async validateBundleAvailability(bundleId: string): Promise<{ available: boolean; unavailableItems: string[] }> {
    const bundle = await this.getBundleProductById(bundleId);
    const unavailableItems: string[] = [];
    for (const item of bundle.bundleItems ?? []) {
      if (!item.productId) {
        continue;
      }
      const product = item.productId as any;
      if (product && typeof product === 'object') {
        if (product.type === ProductType.PHYSICAL) {
          if (!product.stockQuantity || product.stockQuantity < item.quantity) {
            unavailableItems.push(`${product.name} (Required: ${item.quantity}, Available: ${product.stockQuantity || 0})`);
          }
        } else if (product.type === ProductType.DIGITAL) {
          if (!product.isActive || product.status !== ProductStatus.ACTIVE) {
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
export default ProductService;