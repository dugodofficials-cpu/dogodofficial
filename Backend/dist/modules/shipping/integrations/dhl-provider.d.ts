import { ShippingProviderAPI, ShipmentAddress, ShipmentDetails, RateRequest, RateResponse, ShipmentResponse, TrackingInfo } from './shipping-provider.interface';
declare class DHLProvider implements ShippingProviderAPI {
    private readonly apiClient;
    readonly providerName = "DHL";
    readonly supportedCountries: string[];
    readonly supportedServices: string[];
    constructor();
    private convertAddressToDHL;
    private convertDimensionsToDHL;
    private convertWeightToDHL;
    validateAddress(address: ShipmentAddress): Promise<boolean>;
    getRates(request: RateRequest): Promise<RateResponse[]>;
    createShipment(details: ShipmentDetails): Promise<ShipmentResponse>;
    cancelShipment(trackingNumber: string): Promise<boolean>;
    getTrackingInfo(trackingNumber: string): Promise<TrackingInfo>;
    subscribeToTrackingUpdates(trackingNumber: string, callbackUrl: string): Promise<boolean>;
    generateLabel(trackingNumber: string): Promise<string>;
    validateLabel(labelUrl: string): Promise<boolean>;
    schedulePickup(trackingNumbers: string[], pickupDetails: {
        date: Date;
        timeWindow: {
            start: string;
            end: string;
        };
        location: ShipmentAddress;
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
    cancelPickup(confirmationNumber: string): Promise<boolean>;
    validateCredentials(): Promise<boolean>;
    getServiceAreas(): Promise<{
        country: string;
        postalCodes: string[];
    }[]>;
    estimateDeliveryDate(fromPostalCode: string, toPostalCode: string, serviceType: string): Promise<{
        estimatedDate: Date;
        guaranteedDelivery: boolean;
    }>;
}
export default DHLProvider;
