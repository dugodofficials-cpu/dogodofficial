/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { CreateProductDto, UpdateProductDto, UpdateDigitalDeliveryInfoDto, UpdateEbookDeliveryInfoDto } from '../../modules/products/products.dto';
import { Product } from '../../modules/products/products.interface';
import { GetProductsQueryDto, GetDigitalProductsByAlbumsQueryDto } from './products.dto';
interface PaginatedProducts {
    data: Product[];
    total: number;
    page: number;
    limit: number;
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
declare class ProductService {
    products: import("mongoose").Model<Product & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    findAllProducts(query: GetProductsQueryDto, isAdmin?: boolean): Promise<PaginatedProducts>;
    findProductById(productId: string): Promise<Product>;
    findProductBySku(sku: string): Promise<Product>;
    createProduct(productData: CreateProductDto): Promise<Product>;
    updateProduct(productId: string, productData: UpdateProductDto): Promise<Product>;
    deleteProduct(productId: string): Promise<Product>;
    updateStock(productId: string, quantity: number): Promise<Product>;
    searchProducts(query: string): Promise<Product[]>;
    getProductsByCategory(category: string): Promise<Product[]>;
    getActiveProducts(): Promise<Product[]>;
    findProductsByAlbum(album: string, query: GetProductsQueryDto, userId: string): Promise<PaginatedProducts>;
    findDigitalProductsByAlbums(query: GetDigitalProductsByAlbumsQueryDto, userId: string): Promise<PaginatedAlbums>;
    verifyUserProductAccess(userId: string, productId: string): Promise<boolean>;
    updateDigitalDeliveryInfo(productId: string, updateData: UpdateDigitalDeliveryInfoDto): Promise<Product>;
    updateEbookDeliveryInfo(productId: string, updateData: UpdateEbookDeliveryInfoDto): Promise<Product>;
    getBundleProducts(): Promise<Product[]>;
    getBundleProductById(bundleId: string): Promise<Product>;
    calculateBundleValue(bundleId: string): Promise<{
        totalValue: number;
        bundlePrice: number;
        savings: number;
    }>;
    validateBundleAvailability(bundleId: string): Promise<{
        available: boolean;
        unavailableItems: string[];
    }>;
}
export default ProductService;
