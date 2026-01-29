import { Order } from '../../modules/orders/orders.interface';
import { DeliveryStatus } from '../../modules/orders/orders.interface';
import { Country } from '../../modules/countries/countries.interface';
export declare enum ShippingProviderType {
    INTERNAL = "INTERNAL",
    EXTERNAL = "EXTERNAL",
    MARKETPLACE = "MARKETPLACE"
}
export declare enum ShippingMethodType {
    STANDARD = "STANDARD",
    EXPRESS = "EXPRESS",
    OVERNIGHT = "OVERNIGHT",
    TWO_DAY = "TWO_DAY",
    INTERNATIONAL = "INTERNATIONAL",
    LOCAL_PICKUP = "LOCAL_PICKUP",
    LOCAL_DELIVERY = "LOCAL_DELIVERY"
}
export declare enum ShippingRateType {
    FLAT = "FLAT",
    WEIGHT_BASED = "WEIGHT_BASED",
    PRICE_BASED = "PRICE_BASED",
    DISTANCE_BASED = "DISTANCE_BASED",
    DIMENSIONAL = "DIMENSIONAL"
}
export declare enum ShippingStatus {
    PENDING = "PENDING",
    READY_FOR_PICKUP = "READY_FOR_PICKUP",
    PICKED_UP = "PICKED_UP",
    IN_TRANSIT = "IN_TRANSIT",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    FAILED_ATTEMPT = "FAILED_ATTEMPT",
    EXCEPTION = "EXCEPTION",
    RETURNED = "RETURNED"
}
export interface TrackingEvent {
    status: DeliveryStatus;
    location: string;
    timestamp: Date;
    description: string;
    updatedBy: string;
}
export interface ShippingProvider {
    _id: string;
    name: string;
    type: ShippingProviderType;
    description?: string;
    website?: string;
    apiEndpoint?: string;
    apiKey?: string;
    isActive: boolean;
    supportedCountries: Country[] | string[];
    supportedMethods: ShippingMethodType[];
    settings?: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface ShippingZone {
    _id: string;
    name: string;
    description?: string;
    countries: Country[] | string[];
    regions?: string[];
    postalCodes?: string[];
    rate: number;
    isActive: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface ShippingRate {
    _id: string;
    provider: ShippingProvider | string;
    zone: ShippingZone | string;
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
        maxDimensions?: {
            length: number;
            width: number;
            height: number;
            unit: string;
        };
    };
    isActive: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface ShippingLabel {
    _id: string;
    provider: ShippingProvider | string;
    trackingNumber: string;
    trackingUrl?: string;
    labelUrl: string;
    cost: number;
    currency: string;
    status: ShippingStatus;
    weight: number;
    weightUnit: string;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    fromAddress: {
        name: string;
        company?: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        email?: string;
    };
    toAddress: {
        name: string;
        company?: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        email?: string;
    };
    trackingHistory?: {
        status: ShippingStatus;
        location?: string;
        timestamp: Date;
        description?: string;
    }[];
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface ShippingPackage {
    _id: string;
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
    isActive: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface Shipment {
    _id: string;
    order: Order | string;
    provider: ShippingProvider;
    trackingNumber: string;
    status: DeliveryStatus;
    origin: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    destination: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    trackingUrl: string;
    trackingEvents: TrackingEvent[];
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    scheduledDate?: Date;
    shippedDate?: Date;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    label?: ShippingLabel;
    shippingCost: number;
    currency: string;
    insurance?: {
        provider: string;
        coverage: number;
        cost: number;
    };
    notes?: string;
    signature?: {
        required: boolean;
        signedBy?: string;
        signedAt?: Date;
    };
}
