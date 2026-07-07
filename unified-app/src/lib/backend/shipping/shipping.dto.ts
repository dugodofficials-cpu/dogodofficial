import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  ValidateNested,
  Min,
  IsDate,
  IsObject,
  IsMongoId,
  IsArray,
  IsBoolean,
  ArrayMinSize,
  IsUrl,
  IsEmail,
  IsPhoneNumber,
  Length,
  IsDateString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingProviderType, ShippingMethodType, ShippingRateType, ShippingStatus } from './shipping.interface';
export class AddressDto {
  @IsString()
  public name: string;
  @IsOptional()
  @IsString()
  public company?: string;
  @IsString()
  public street: string;
  @IsString()
  public city: string;
  @IsString()
  public state: string;
  @IsString()
  public postalCode: string;
  @IsString()
  public country: string;
  @IsPhoneNumber()
  public phone: string;
  @IsOptional()
  @IsEmail()
  public email?: string;
}
export class DimensionsDto {
  @IsNumber()
  @Min(0)
  public length: number;
  @IsNumber()
  @Min(0)
  public width: number;
  @IsNumber()
  @Min(0)
  public height: number;
  @IsString()
  @Matches(/^(cm|in)$/)
  public unit: string;
}
export class CreateProviderDto {
  @IsString()
  public name: string;
  @IsEnum(ShippingProviderType)
  public type: ShippingProviderType;
  @IsOptional()
  @IsString()
  public description?: string;
  @IsOptional()
  @IsUrl()
  public website?: string;
  @IsOptional()
  @IsUrl()
  public apiEndpoint?: string;
  @IsOptional()
  @IsString()
  public apiKey?: string;
  @IsArray()
  @IsMongoId({ each: true })
  public supportedCountries: string[];
  @IsArray()
  @IsEnum(ShippingMethodType, { each: true })
  public supportedMethods: ShippingMethodType[];
  @IsOptional()
  @IsObject()
  public settings?: Record<string, any>;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class UpdateProviderDto {
  @IsOptional()
  @IsString()
  public name?: string;
  @IsOptional()
  @IsEnum(ShippingProviderType)
  public type?: ShippingProviderType;
  @IsOptional()
  @IsString()
  public description?: string;
  @IsOptional()
  @IsUrl()
  public website?: string;
  @IsOptional()
  @IsUrl()
  public apiEndpoint?: string;
  @IsOptional()
  @IsString()
  public apiKey?: string;
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  public supportedCountries?: string[];
  @IsOptional()
  @IsArray()
  @IsEnum(ShippingMethodType, { each: true })
  public supportedMethods?: ShippingMethodType[];
  @IsOptional()
  @IsObject()
  public settings?: Record<string, any>;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class CreateZoneDto {
  @IsString()
  public name: string;
  @IsOptional()
  @IsString()
  public description?: string;
  @IsArray()
  @IsMongoId({ each: true })
  public countries: string[];
  @IsNumber()
  @Min(0)
  public rate: number;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public regions?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public postalCodes?: string[];
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  public name?: string;
  @IsOptional()
  @IsString()
  public description?: string;
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  public countries?: string[];
  @IsOptional()
  @IsNumber()
  @Min(0)
  public rate?: number;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public regions?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public postalCodes?: string[];
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class CreateRateDto {
  @IsMongoId()
  public provider: string;
  @IsMongoId()
  public zone: string;
  @IsEnum(ShippingMethodType)
  public method: ShippingMethodType;
  @IsEnum(ShippingRateType)
  public type: ShippingRateType;
  @IsString()
  public name: string;
  @IsOptional()
  @IsString()
  public description?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public minimumOrderAmount?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public maximumOrderAmount?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public minimumWeight?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public maximumWeight?: number;
  @IsNumber()
  @Min(0)
  public baseRate: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public additionalRate?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public freeShippingThreshold?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public weightIncrement?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public priceIncrement?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public distanceIncrement?: number;
  @IsOptional()
  @IsObject()
  public restrictions?: {
    excludedProducts?: string[];
    excludedCategories?: string[];
    maxDimensions?: DimensionsDto;
  };
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class UpdateRateDto {
  @IsOptional()
  @IsString()
  public name?: string;
  @IsOptional()
  @IsString()
  public description?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public minimumOrderAmount?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public maximumOrderAmount?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public minimumWeight?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public maximumWeight?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public baseRate?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public additionalRate?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public freeShippingThreshold?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public weightIncrement?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public priceIncrement?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public distanceIncrement?: number;
  @IsOptional()
  @IsObject()
  public restrictions?: {
    excludedProducts?: string[];
    excludedCategories?: string[];
    maxDimensions?: DimensionsDto;
  };
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class CreateLabelDto {
  @IsMongoId()
  public provider: string;
  @IsString()
  public trackingNumber: string;
  @IsOptional()
  @IsUrl()
  public trackingUrl?: string;
  @IsUrl()
  public labelUrl: string;
  @IsNumber()
  @Min(0)
  public cost: number;
  @IsString()
  @Length(3, 3)
  public currency: string;
  @IsNumber()
  @Min(0)
  public weight: number;
  @IsString()
  @Matches(/^(kg|lb)$/)
  public weightUnit: string;
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  public dimensions?: DimensionsDto;
  @ValidateNested()
  @Type(() => AddressDto)
  public fromAddress: AddressDto;
  @ValidateNested()
  @Type(() => AddressDto)
  public toAddress: AddressDto;
  @IsOptional()
  @IsDateString()
  public estimatedDeliveryDate?: Date;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class UpdateLabelDto {
  @IsOptional()
  @IsEnum(ShippingStatus)
  public status?: ShippingStatus;
  @IsOptional()
  @IsUrl()
  public trackingUrl?: string;
  @IsOptional()
  @IsDateString()
  public estimatedDeliveryDate?: Date;
  @IsOptional()
  @IsDateString()
  public actualDeliveryDate?: Date;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class AddTrackingHistoryDto {
  @IsEnum(ShippingStatus)
  public status: ShippingStatus;
  @IsOptional()
  @IsString()
  public location?: string;
  @IsString()
  public description: string;
}
export class CreatePackageDto {
  @IsString()
  public name: string;
  @IsOptional()
  @IsString()
  public description?: string;
  @IsNumber()
  @Min(0)
  public length: number;
  @IsNumber()
  @Min(0)
  public width: number;
  @IsNumber()
  @Min(0)
  public height: number;
  @IsString()
  @Matches(/^(cm|in)$/)
  public dimensionUnit: string;
  @IsNumber()
  @Min(0)
  public weight: number;
  @IsString()
  @Matches(/^(kg|lb)$/)
  public weightUnit: string;
  @IsNumber()
  @Min(0)
  public maxWeight: number;
  @IsNumber()
  @Min(0)
  public volume: number;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class UpdatePackageDto {
  @IsOptional()
  @IsString()
  public name?: string;
  @IsOptional()
  @IsString()
  public description?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public length?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public width?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public height?: number;
  @IsOptional()
  @IsString()
  @Matches(/^(cm|in)$/)
  public dimensionUnit?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public weight?: number;
  @IsOptional()
  @IsString()
  @Matches(/^(kg|lb)$/)
  public weightUnit?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public maxWeight?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public volume?: number;
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}