import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsBoolean, ValidateNested, Min, ArrayMinSize, Max, IsIn, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType, ProductStatus } from './products.interface';
export class ProductDimensionsDto {
  @IsNumber()
  @Min(0)
  public weight: number;
  @IsNumber()
  @Min(0)
  public length: number;
  @IsNumber()
  @Min(0)
  public width: number;
  @IsNumber()
  @Min(0)
  public height: number;
}
export class DigitalDeliveryInfoDto {
  @IsOptional()
  @IsString()
  public downloadUrl?: string;
  @IsOptional()
  @IsString()
  public accessKey?: string;
  @IsOptional()
  @IsNumber()
  @Min(1)
  public expiryDays?: number;
  @IsOptional()
  @IsNumber()
  @Min(1)
  public maxDownloads?: number;
}
export class EbookDeliveryInfoDto {
  @IsOptional()
  @IsString()
  public downloadUrl?: string;
  @IsOptional()
  @IsString()
  public bookCoverArt?: string;
  @IsOptional()
  @IsString()
  public accessKey?: string;
  @IsOptional()
  @IsNumber()
  @Min(1)
  public expiryDays?: number;
  @IsOptional()
  @IsNumber()
  @Min(1)
  public maxDownloads?: number;
}
export class BundleItemDto {
  @IsOptional()
  @IsString()
  public productId?: string;
  @IsString()
  public title: string;
  @IsNumber()
  @Min(1)
  public quantity: number;
  @IsOptional()
  @IsString()
  public bundleTier?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  public discountPercentage?: number;
}
export class CreateProductDto {
  @IsOptional()
  @IsString()
  public audioFile?: Express.Multer.File;
  @IsString()
  public name: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public order?: number;
  @IsString()
  @IsOptional()
  public album: string;
  @IsNumber()
  @IsOptional()
  @Min(0)
  public albumPrice: number;
  @IsString()
  @IsOptional()
  public duration: string;
  @IsString()
  public description: string;
  @IsString()
  public sku: string;
  @IsNumber()
  @Min(0)
  public price: number;
  @IsEnum(ProductType)
  public type: ProductType;
  @IsEnum(ProductStatus)
  public status: ProductStatus;
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  public categories: string[];
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  public tags?: string[];
  @IsArray()
  // Storage keys, not URLs — the bucket isn't publicly readable, so these get
  // resolved to a fresh signed URL at response time (signPublicUrls
  // middleware), same as digitalDeliveryInfo/ebookDeliveryInfo below.
  @IsString({ each: true })
  @ArrayMinSize(1)
  public images: string[];
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDimensionsDto)
  public dimensions?: ProductDimensionsDto;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public sizes?: string[];
  @IsOptional()
  @IsString()
  public color: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public stockQuantity?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public lowStockThreshold?: number;
  @IsOptional()
  @ValidateNested()
  @Type(() => DigitalDeliveryInfoDto)
  public digitalDeliveryInfo?: DigitalDeliveryInfoDto;

  @IsOptional()
  @IsString()
  public previewUrl?: string;
  @IsOptional()
  @ValidateNested()
  @Type(() => EbookDeliveryInfoDto)
  public ebookDeliveryInfo?: EbookDeliveryInfoDto;
  @IsOptional()
  @IsString()
  public albumId?: string;
  @ValidateIf(o => o.type === ProductType.BUNDLE)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  @ArrayMinSize(1)
  public bundleItems?: BundleItemDto[];
  @ValidateIf(o => o.type === ProductType.BUNDLE)
  @IsNumber()
  @Min(0)
  public bundlePrice?: number;
  @IsOptional()
  @IsString()
  @IsIn(['platinum', 'diamond', 'gold'])
  public bundleTier?: string;
  @IsOptional()
  @IsBoolean()
  public isCustomizable?: boolean;
  @IsOptional()
  @IsNumber()
  @Min(1)
  public minItems?: number;
  @IsOptional()
  @IsNumber()
  @Min(1)
  public maxItems?: number;
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
export class UpdateProductDto extends CreateProductDto {
  @IsOptional()
  @IsString()
  public name: string;
  @IsOptional()
  @IsString()
  public description: string;
  @IsOptional()
  @IsString()
  public sku: string;
  @IsOptional()
  @IsString()
  public album: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public order?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public price: number;
  @IsOptional()
  @IsEnum(ProductType)
  public type: ProductType;
  @IsOptional()
  @IsEnum(ProductStatus)
  public status: ProductStatus;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public categories: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public images: string[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BundleItemDto)
  public bundleItems?: BundleItemDto[];
  @IsOptional()
  @IsNumber()
  @Min(0)
  public bundlePrice?: number;
  @IsOptional()
  @IsString()
  @IsIn(['platinum', 'diamond', 'gold'])
  public bundleTier?: string;
}
export class UpdateDigitalDeliveryInfoDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => DigitalDeliveryInfoDto)
  public digitalDeliveryInfo?: DigitalDeliveryInfoDto;
}
export class UpdateEbookDeliveryInfoDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => EbookDeliveryInfoDto)
  public ebookDeliveryInfo?: EbookDeliveryInfoDto;
}
export class GetProductsQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  public page?: number = 1;
  @IsOptional()
  @IsString()
  public exclude?: string;
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  public limit?: number = 10;
  @IsOptional()
  @IsString()
  public search?: string;
  @IsOptional()
  @IsEnum(ProductType)
  public type?: ProductType;
  @IsOptional()
  @IsEnum(ProductStatus)
  public status?: ProductStatus;
  @IsOptional()
  @IsString()
  public category?: string;
  @IsOptional()
  @IsString()
  public tag?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public minPrice?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public maxPrice?: number;
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  public isActive?: boolean;
  @IsOptional()
  @IsString()
  public sortBy?: 'name' | 'price' | 'createdAt' = 'createdAt';
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public sortOrder?: 'asc' | 'desc' = 'desc';
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  public includeBundleItems?: boolean = false;
}
export class GetDigitalProductsByAlbumsQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  public page?: number = 1;
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  public limit?: number = 10;
  @IsOptional()
  @IsString()
  public search?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public minPrice?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public maxPrice?: number;
  @IsOptional()
  @IsString()
  public sortBy?: 'name' | 'price' | 'createdAt' | 'album' = 'album';
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public sortOrder?: 'asc' | 'desc' = 'asc';
}