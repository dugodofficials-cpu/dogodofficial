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
import { ShippingProvider, ShippingZone, ShippingRate, ShippingLabel, ShippingPackage } from '../../modules/shipping/shipping.interface';
import { CreateProviderDto, UpdateProviderDto, CreateZoneDto, UpdateZoneDto, CreateRateDto, UpdateRateDto, CreateLabelDto, UpdateLabelDto, AddTrackingHistoryDto, CreatePackageDto, UpdatePackageDto } from '../../modules/shipping/shipping.dto';
import { ShipmentDetails } from './integrations/shipping-provider.interface';
import { ShippingDetailsDto } from '../orders/orders.dto';
declare class ShippingService {
    providers: import("mongoose").Model<ShippingProvider & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    zones: import("mongoose").Model<ShippingZone & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    rates: import("mongoose").Model<ShippingRate & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    labels: import("mongoose").Model<ShippingLabel & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    packages: import("mongoose").Model<ShippingPackage & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    isRegionOrPostalCodeInZone(zone: ShippingZone, region?: string, postalCode?: string): boolean;
    findAllProviders(): Promise<ShippingProvider[]>;
    findProviderById(providerId: string): Promise<ShippingProvider>;
    createProvider(providerData: CreateProviderDto): Promise<ShippingProvider>;
    updateProvider(providerId: string, providerData: UpdateProviderDto): Promise<ShippingProvider>;
    deleteProvider(providerId: string): Promise<ShippingProvider>;
    findAllZones(): Promise<ShippingZone[]>;
    findZoneById(zoneId: string): Promise<ShippingZone>;
    createZone(zoneData: CreateZoneDto): Promise<ShippingZone>;
    updateZone(zoneId: string, zoneData: UpdateZoneDto): Promise<ShippingZone>;
    deleteZone(zoneId: string): Promise<ShippingZone>;
    findAllRates(): Promise<ShippingRate[]>;
    findRateById(rateId: string): Promise<ShippingRate>;
    findRatesByZone(zoneId: string): Promise<ShippingRate[]>;
    findRateByZone(region: string, postalCode: string): Promise<ShippingZone[]>;
    calculateShippingRate(shippingDetails: ShippingDetailsDto): Promise<number>;
    createRate(rateData: CreateRateDto): Promise<ShippingRate>;
    updateRate(rateId: string, rateData: UpdateRateDto): Promise<ShippingRate>;
    deleteRate(rateId: string): Promise<ShippingRate>;
    findAllLabels(): Promise<ShippingLabel[]>;
    findLabelById(labelId: string): Promise<ShippingLabel>;
    findLabelByTrackingNumber(trackingNumber: string): Promise<ShippingLabel>;
    createLabel(labelData: CreateLabelDto): Promise<ShippingLabel>;
    updateLabel(labelId: string, labelData: UpdateLabelDto): Promise<ShippingLabel>;
    addTrackingHistory(labelId: string, historyData: AddTrackingHistoryDto): Promise<ShippingLabel>;
    deleteLabel(labelId: string): Promise<ShippingLabel>;
    findAllPackages(): Promise<ShippingPackage[]>;
    findPackageById(packageId: string): Promise<ShippingPackage>;
    createPackage(packageData: CreatePackageDto): Promise<ShippingPackage>;
    updatePackage(packageId: string, packageData: UpdatePackageDto): Promise<ShippingPackage>;
    deletePackage(packageId: string): Promise<ShippingPackage>;
    validateProviderCredentials(providerId: string): Promise<boolean>;
    getAvailableProviders(): Promise<string[]>;
    validateShippingAddress(providerId: string, address: {
        name: string;
        company?: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        email?: string;
    }): Promise<boolean>;
    getRatesFromProvider(providerId: string, details: ShipmentDetails): Promise<{
        provider: string;
        service: string;
        rate: {
            amount: number;
            currency: string;
        };
        estimatedDays: number;
        guaranteedDelivery: boolean;
    }[]>;
    createShipmentWithProvider(providerId: string, details: ShipmentDetails): Promise<ShippingLabel>;
    cancelShipmentWithProvider(labelId: string): Promise<boolean>;
    updateTrackingInfo(labelId: string): Promise<ShippingLabel>;
    subscribeToTrackingUpdates(labelId: string, callbackUrl: string): Promise<boolean>;
    schedulePickup(labelIds: string[], pickupDetails: {
        date: Date;
        timeWindow: {
            start: string;
            end: string;
        };
        location: {
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
        instructions?: string;
    }): Promise<{
        confirmationNumber: string;
        pickupTime: {
            date: Date;
            timeWindow: {
                start: string;
                end: string;
            };
        };
    }>;
    cancelPickup(providerId: string, confirmationNumber: string): Promise<boolean>;
    estimateDeliveryDate(providerId: string, fromPostalCode: string, toPostalCode: string, serviceType: string): Promise<{
        estimatedDate: Date;
        guaranteedDelivery: boolean;
    }>;
}
export default ShippingService;
