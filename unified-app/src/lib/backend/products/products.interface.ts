export enum ProductType {
  DIGITAL = 'DIGITAL',
  PHYSICAL = 'PHYSICAL',
  BUNDLE = 'BUNDLE',
  EBOOK = 'EBOOK',
}
export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}
export interface ProductDimensions {
  weight: number;
  length: number;
  width: number;
  height: number;
}
export interface DigitalDeliveryInfo {
  downloadUrl?: string;
  accessKey?: string;
  expiryDays?: number;
  maxDownloads?: number;
}
export interface EbookDeliveryInfo {
  downloadUrl?: string;
  bookCoverArt?: string;
  accessKey?: string;
  expiryDays?: number;
  maxDownloads?: number;
}
export interface BundleItem {
  productId?: string;
  title: string;
  quantity: number;
  discountPercentage?: number;
  bundleTier?: string;
}
export interface BundleProduct extends Product {
  bundleItems: BundleItem[];
  bundlePrice: number;
  isCustomizable?: boolean;
  minItems?: number;
  maxItems?: number;
}
export interface Product {
  _id: string;
  name: string;
  order: number;
  album: string;
  albumPrice: number;
  duration: string;
  description: string;
  sku: string;
  price: number;
  type: ProductType;
  status: ProductStatus;
  categories: string[];
  tags: string[];
  images: string[];
  sizes: string[];
  color: string
  dimensions?: ProductDimensions;
  stockQuantity?: number;
  lowStockThreshold?: number;
  digitalDeliveryInfo?: DigitalDeliveryInfo;
  previewUrl?: string;
  albumId?: string;
  ebookDeliveryInfo?: EbookDeliveryInfo;
  bundleItems?: BundleItem[];
  bundlePrice?: number;
  isCustomizable?: boolean;
  minItems?: number;
  maxItems?: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}