/// <reference types="multer" />
import { ProductType, ProductStatus } from './products.interface';
export declare class ProductDimensionsDto {
    weight: number;
    length: number;
    width: number;
    height: number;
}
export declare class DigitalDeliveryInfoDto {
    downloadUrl?: string;
    accessKey?: string;
    expiryDays?: number;
    maxDownloads?: number;
}
export declare class EbookDeliveryInfoDto {
    downloadUrl?: string;
    bookCoverArt?: string;
    accessKey?: string;
    expiryDays?: number;
    maxDownloads?: number;
}
export declare class BundleItemDto {
    productId?: string;
    title: string;
    quantity: number;
    bundleTier?: string;
    discountPercentage?: number;
}
export declare class CreateProductDto {
    audioFile?: Express.Multer.File;
    name: string;
    order?: number;
    album: string;
    albumPrice: number;
    duration: string;
    description: string;
    sku: string;
    price: number;
    type: ProductType;
    status: ProductStatus;
    categories: string[];
    tags?: string[];
    images: string[];
    dimensions?: ProductDimensionsDto;
    sizes?: string[];
    color: string;
    stockQuantity?: number;
    lowStockThreshold?: number;
    digitalDeliveryInfo?: DigitalDeliveryInfoDto;
    ebookDeliveryInfo?: EbookDeliveryInfoDto;
    albumId?: string;
    bundleItems?: BundleItemDto[];
    bundlePrice?: number;
    bundleTier?: string;
    isCustomizable?: boolean;
    minItems?: number;
    maxItems?: number;
    isActive?: boolean;
}
export declare class UpdateProductDto extends CreateProductDto {
    name: string;
    description: string;
    sku: string;
    album: string;
    order?: number;
    price: number;
    type: ProductType;
    status: ProductStatus;
    categories: string[];
    images: string[];
    bundleItems?: BundleItemDto[];
    bundlePrice?: number;
    bundleTier?: string;
}
export declare class UpdateDigitalDeliveryInfoDto {
    digitalDeliveryInfo?: DigitalDeliveryInfoDto;
}
export declare class UpdateEbookDeliveryInfoDto {
    ebookDeliveryInfo?: EbookDeliveryInfoDto;
}
export declare class GetProductsQueryDto {
    page?: number;
    exclude?: string;
    limit?: number;
    search?: string;
    type?: ProductType;
    status?: ProductStatus;
    category?: string;
    tag?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    includeBundleItems?: boolean;
}
export declare class GetDigitalProductsByAlbumsQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name' | 'price' | 'createdAt' | 'album';
    sortOrder?: 'asc' | 'desc';
}
