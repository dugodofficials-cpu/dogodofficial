import { ShippingLabel, ShippingStatus } from '@/modules/shipping/shipping.interface';
export interface ShipmentDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}
export interface ShipmentWeight {
  value: number;
  unit: 'kg' | 'lb';
}
export interface ShipmentAddress {
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
export interface ShipmentDetails {
  dimensions: ShipmentDimensions;
  weight: ShipmentWeight;
  fromAddress: ShipmentAddress;
  toAddress: ShipmentAddress;
  packageType?: string;
  description?: string;
  declaredValue?: {
    amount: number;
    currency: string;
  };
  isSignatureRequired?: boolean;
  isInsured?: boolean;
  insuranceAmount?: number;
  customsInfo?: {
    contentType: 'documents' | 'merchandise';
    contentDescription: string;
    value: number;
    currency: string;
    originCountry: string;
  };
}
export interface RateRequest {
  shipmentDetails: ShipmentDetails;
  serviceType?: string;
  pickupType?: string;
}
export interface RateResponse {
  provider: string;
  service: string;
  rate: {
    amount: number;
    currency: string;
  };
  estimatedDays: number;
  guaranteedDelivery: boolean;
}
export interface ShipmentResponse {
  trackingNumber: string;
  labelUrl: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  rate: {
    amount: number;
    currency: string;
  };
}
export interface TrackingInfo {
  trackingNumber: string;
  status: ShippingStatus;
  location?: string;
  timestamp: Date;
  description?: string;
}
export interface ShippingProviderAPI {
  readonly providerName: string;
  readonly supportedCountries: string[];
  readonly supportedServices: string[];
  validateAddress(address: ShipmentAddress): Promise<boolean>;
  getRates(request: RateRequest): Promise<RateResponse[]>;
  createShipment(details: ShipmentDetails): Promise<ShipmentResponse>;
  cancelShipment(trackingNumber: string): Promise<boolean>;
  getTrackingInfo(trackingNumber: string): Promise<TrackingInfo>;
  subscribeToTrackingUpdates(trackingNumber: string, callbackUrl: string): Promise<boolean>;
  generateLabel(trackingNumber: string): Promise<string>;
  validateLabel(labelUrl: string): Promise<boolean>;
  schedulePickup(
    trackingNumbers: string[],
    pickupDetails: {
      date: Date;
      timeWindow: {
        start: string;
        end: string;
      };
      location: ShipmentAddress;
      instructions?: string;
    },
  ): Promise<{
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
  getServiceAreas(): Promise<
    {
      country: string;
      postalCodes: string[];
    }[]
  >;
  estimateDeliveryDate(
    fromPostalCode: string,
    toPostalCode: string,
    serviceType: string,
  ): Promise<{
    estimatedDate: Date;
    guaranteedDelivery: boolean;
  }>;
}