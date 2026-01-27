import axios, { AxiosInstance } from 'axios';
import { ShippingStatus } from '@/modules/shipping/shipping.interface';
import {
  ShippingProviderAPI,
  ShipmentAddress,
  ShipmentDetails,
  RateRequest,
  RateResponse,
  ShipmentResponse,
  TrackingInfo,
} from './shipping-provider.interface';
import { shippingConfig } from '@config';
class DHLProvider implements ShippingProviderAPI {
  private readonly apiClient: AxiosInstance;
  public readonly providerName = 'DHL';
  public readonly supportedCountries = [
    'US',
    'GB',
    'DE',
    'FR',
    'IT',
    'ES',
    'CA',
    'AU',
    'JP',
    'CN',
  ];
  public readonly supportedServices = [
    'EXPRESS_WORLDWIDE',
    'EXPRESS_12:00',
    'EXPRESS_9:00',
    'ECONOMY_SELECT',
    'DOMESTIC_EXPRESS',
    'DOMESTIC_EXPRESS_12:00',
    'DOMESTIC_ECONOMY',
  ];
  constructor() {
    this.apiClient = axios.create({
      baseURL: shippingConfig.dhl.apiEndpoint,
      headers: {
        Authorization: `Bearer ${shippingConfig.dhl.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    this.apiClient.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          const { status, data } = error.response;
          throw new Error(`DHL API Error (${status}): ${data.message || 'Unknown error'}`);
        }
        throw error;
      },
    );
  }
  private convertAddressToDHL(address: ShipmentAddress) {
    return {
      addressLine1: address.street,
      city: address.city,
      stateOrProvinceCode: address.state,
      postalCode: address.postalCode,
      countryCode: address.country,
      personName: address.name,
      companyName: address.company,
      phoneNumber: address.phone,
      email: address.email,
    };
  }
  private convertDimensionsToDHL(details: ShipmentDetails) {
    const conversionFactor = details.dimensions.unit === 'in' ? 2.54 : 1;
    return {
      length: details.dimensions.length * conversionFactor,
      width: details.dimensions.width * conversionFactor,
      height: details.dimensions.height * conversionFactor,
      unit: 'cm',
    };
  }
  private convertWeightToDHL(details: ShipmentDetails) {
    const conversionFactor = details.weight.unit === 'lb' ? 0.453592 : 1;
    return {
      value: details.weight.value * conversionFactor,
      unit: 'kg',
    };
  }
  async validateAddress(address: ShipmentAddress): Promise<boolean> {
    try {
      const response = await this.apiClient.post('/address-validation', {
        address: this.convertAddressToDHL(address),
      });
      return response.data.isValid === true;
    } catch (error) {
      console.error('DHL address validation error:', error);
      return false;
    }
  }
  async getRates(request: RateRequest): Promise<RateResponse[]> {
    const dhlRequest = {
      customerDetails: {
        shipperDetails: this.convertAddressToDHL(request.shipmentDetails.fromAddress),
        receiverDetails: this.convertAddressToDHL(request.shipmentDetails.toAddress),
      },
      plannedShippingDateAndTime: new Date().toISOString(),
      unitOfMeasurement: 'metric',
      packages: [
        {
          weight: this.convertWeightToDHL(request.shipmentDetails),
          dimensions: this.convertDimensionsToDHL(request.shipmentDetails),
        },
      ],
      productCode: request.serviceType,
    };
    const response = await this.apiClient.post('/rates', dhlRequest);
    return response.data.products.map(product => ({
      provider: this.providerName,
      service: product.productName,
      rate: {
        amount: product.totalPrice,
        currency: product.currency,
      },
      estimatedDays: product.deliveryTime.days,
      guaranteedDelivery: product.deliveryCapabilities.guaranteedDelivery,
    }));
  }
  async createShipment(details: ShipmentDetails): Promise<ShipmentResponse> {
    const shipmentRequest = {
      plannedShippingDateAndTime: new Date().toISOString(),
      pickup: {
        isRequested: false,
      },
      productCode: 'EXPRESS_WORLDWIDE',
      customerDetails: {
        shipperDetails: this.convertAddressToDHL(details.fromAddress),
        receiverDetails: this.convertAddressToDHL(details.toAddress),
      },
      content: {
        packages: [
          {
            weight: this.convertWeightToDHL(details),
            dimensions: this.convertDimensionsToDHL(details),
            customerReferences: [
              {
                value: details.description || 'No description provided',
              },
            ],
          },
        ],
      },
      valueAddedServices: {
        insurance: details.isInsured
          ? {
              value: details.insuranceAmount,
              currency: details.declaredValue?.currency || 'USD',
            }
          : undefined,
        signature: details.isSignatureRequired
          ? {
              isRequested: true,
            }
          : undefined,
      },
      customs: details.customsInfo
        ? {
            exportDeclaration: {
              lineItems: [
                {
                  description: details.customsInfo.contentDescription,
                  value: details.customsInfo.value,
                  currency: details.customsInfo.currency,
                  countryOfOrigin: details.customsInfo.originCountry,
                },
              ],
            },
          }
        : undefined,
    };
    const response = await this.apiClient.post('/shipments', shipmentRequest);
    return {
      trackingNumber: response.data.shipmentTrackingNumber,
      labelUrl: response.data.documents.find(doc => doc.type === 'label').url,
      trackingUrl: `https://track.dhl.com/${response.data.shipmentTrackingNumber}`,
      estimatedDelivery: new Date(response.data.estimatedDeliveryDate),
      rate: {
        amount: response.data.price.amount,
        currency: response.data.price.currency,
      },
    };
  }
  async cancelShipment(trackingNumber: string): Promise<boolean> {
    try {
      await this.apiClient.delete(`/shipments/${trackingNumber}`);
      return true;
    } catch (error) {
      console.error('DHL shipment cancellation error:', error);
      return false;
    }
  }
  async getTrackingInfo(trackingNumber: string): Promise<TrackingInfo> {
    const response = await this.apiClient.get(`/tracking/${trackingNumber}`);
    const latestEvent = response.data.shipments[0].events[0];
    const statusMap: Record<string, ShippingStatus> = {
      PU: ShippingStatus.PICKED_UP,
      DF: ShippingStatus.IN_TRANSIT,
      AF: ShippingStatus.IN_TRANSIT,
      AR: ShippingStatus.IN_TRANSIT,
      OH: ShippingStatus.OUT_FOR_DELIVERY,
      OK: ShippingStatus.DELIVERED,
      NH: ShippingStatus.FAILED_ATTEMPT,
      RT: ShippingStatus.RETURNED,
    };
    return {
      trackingNumber,
      status: statusMap[latestEvent.code] || ShippingStatus.PENDING,
      location: `${latestEvent.location.city}, ${latestEvent.location.countryCode}`,
      timestamp: new Date(latestEvent.timestamp),
      description: latestEvent.description,
    };
  }
  async subscribeToTrackingUpdates(trackingNumber: string, callbackUrl: string): Promise<boolean> {
    try {
      await this.apiClient.post('/tracking/subscriptions', {
        trackingNumber,
        callbackUrl,
        events: ['pickup', 'delivery', 'movement', 'exception'],
      });
      return true;
    } catch (error) {
      console.error('DHL tracking subscription error:', error);
      return false;
    }
  }
  async generateLabel(trackingNumber: string): Promise<string> {
    const response = await this.apiClient.get(`/shipments/${trackingNumber}/label`);
    return response.data.url;
  }
  async validateLabel(labelUrl: string): Promise<boolean> {
    try {
      const response = await axios.head(labelUrl);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
  async schedulePickup(
    trackingNumbers: string[],
    pickupDetails: {
      date: Date;
      timeWindow: { start: string; end: string };
      location: ShipmentAddress;
      instructions?: string;
    },
  ): Promise<{
    confirmationNumber: string;
    pickupTime: { date: Date; timeWindow: { start: string; end: string } };
  }> {
    const response = await this.apiClient.post('/pickups', {
      shipmentDetails: {
        awbNumbers: trackingNumbers,
      },
      pickupDetails: {
        pickupDate: pickupDetails.date.toISOString().split('T')[0],
        pickupTimeWindow: pickupDetails.timeWindow,
        location: this.convertAddressToDHL(pickupDetails.location),
        specialInstructions: pickupDetails.instructions,
      },
    });
    return {
      confirmationNumber: response.data.dispatchConfirmationNumber,
      pickupTime: {
        date: new Date(response.data.readyByTime.date),
        timeWindow: {
          start: response.data.readyByTime.timeWindow.start,
          end: response.data.readyByTime.timeWindow.end,
        },
      },
    };
  }
  async cancelPickup(confirmationNumber: string): Promise<boolean> {
    try {
      await this.apiClient.delete(`/pickups/${confirmationNumber}`);
      return true;
    } catch (error) {
      console.error('DHL pickup cancellation error:', error);
      return false;
    }
  }
  async validateCredentials(): Promise<boolean> {
    try {
      await this.apiClient.get('/auth/test');
      return true;
    } catch (error) {
      return false;
    }
  }
  async getServiceAreas(): Promise<{ country: string; postalCodes: string[] }[]> {
    const response = await this.apiClient.get('/service-areas');
    return response.data.serviceAreas.map(area => ({
      country: area.countryCode,
      postalCodes: area.postalCodes,
    }));
  }
  async estimateDeliveryDate(
    fromPostalCode: string,
    toPostalCode: string,
    serviceType: string,
  ): Promise<{ estimatedDate: Date; guaranteedDelivery: boolean }> {
    const response = await this.apiClient.post('/delivery-time', {
      originPostalCode: fromPostalCode,
      destinationPostalCode: toPostalCode,
      productCode: serviceType,
      plannedShippingDate: new Date().toISOString().split('T')[0],
    });
    return {
      estimatedDate: new Date(response.data.estimatedDeliveryDate),
      guaranteedDelivery: response.data.guaranteedDelivery,
    };
  }
}
export default DHLProvider;