import { ShippingProviderType, ShippingMethodType, ShippingRateType, ShippingStatus } from './shipping.interface';
export declare class AddressDto {
    name: string;
    company?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email?: string;
}
export declare class DimensionsDto {
    length: number;
    width: number;
    height: number;
    unit: string;
}
export declare class CreateProviderDto {
    name: string;
    type: ShippingProviderType;
    description?: string;
    website?: string;
    apiEndpoint?: string;
    apiKey?: string;
    supportedCountries: string[];
    supportedMethods: ShippingMethodType[];
    settings?: Record<string, any>;
    metadata?: Record<string, any>;
}
export declare class UpdateProviderDto {
    name?: string;
    type?: ShippingProviderType;
    description?: string;
    website?: string;
    apiEndpoint?: string;
    apiKey?: string;
    isActive?: boolean;
    supportedCountries?: string[];
    supportedMethods?: ShippingMethodType[];
    settings?: Record<string, any>;
    metadata?: Record<string, any>;
}
export declare class CreateZoneDto {
    name: string;
    description?: string;
    countries: string[];
    rate: number;
    regions?: string[];
    postalCodes?: string[];
    metadata?: Record<string, any>;
}
export declare class UpdateZoneDto {
    name?: string;
    description?: string;
    countries?: string[];
    rate?: number;
    regions?: string[];
    postalCodes?: string[];
    isActive?: boolean;
    metadata?: Record<string, any>;
}
export declare class CreateRateDto {
    provider: string;
    zone: string;
    method: ShippingMethodType;
    type: ShippingRateType;
    name: string;
    description?: string;
    minimumOrderAmount?: number;
    maximumOrderAmount?: number;
    minimumWeight?: number;
    maximumWeight?: number;
    baseRate: number;
    additionalRate?: number;
    freeShippingThreshold?: number;
    weightIncrement?: number;
    priceIncrement?: number;
    distanceIncrement?: number;
    restrictions?: {
        excludedProducts?: string[];
        excludedCategories?: string[];
        maxDimensions?: DimensionsDto;
    };
    metadata?: Record<string, any>;
}
export declare class UpdateRateDto {
    name?: string;
    description?: string;
    minimumOrderAmount?: number;
    maximumOrderAmount?: number;
    minimumWeight?: number;
    maximumWeight?: number;
    baseRate?: number;
    additionalRate?: number;
    freeShippingThreshold?: number;
    weightIncrement?: number;
    priceIncrement?: number;
    distanceIncrement?: number;
    restrictions?: {
        excludedProducts?: string[];
        excludedCategories?: string[];
        maxDimensions?: DimensionsDto;
    };
    isActive?: boolean;
    metadata?: Record<string, any>;
}
export declare class CreateLabelDto {
    provider: string;
    trackingNumber: string;
    trackingUrl?: string;
    labelUrl: string;
    cost: number;
    currency: string;
    weight: number;
    weightUnit: string;
    dimensions?: DimensionsDto;
    fromAddress: AddressDto;
    toAddress: AddressDto;
    estimatedDeliveryDate?: Date;
    metadata?: Record<string, any>;
}
export declare class UpdateLabelDto {
    status?: ShippingStatus;
    trackingUrl?: string;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    metadata?: Record<string, any>;
}
export declare class AddTrackingHistoryDto {
    status: ShippingStatus;
    location?: string;
    description: string;
}
export declare class CreatePackageDto {
    name: string;
    description?: string;
    length: number;
    width: number;
    height: number;
    dimensionUnit: string;
    weight: number;
    weightUnit: string;
    maxWeight: number;
    volume: number;
    metadata?: Record<string, any>;
}
export declare class UpdatePackageDto {
    name?: string;
    description?: string;
    length?: number;
    width?: number;
    height?: number;
    dimensionUnit?: string;
    weight?: number;
    weightUnit?: string;
    maxWeight?: number;
    volume?: number;
    isActive?: boolean;
    metadata?: Record<string, any>;
}
