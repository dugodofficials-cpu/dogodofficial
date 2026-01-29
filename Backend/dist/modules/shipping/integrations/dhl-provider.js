"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const shipping_interface_1 = require("../../../modules/shipping/shipping.interface");
const _config_1 = require("../../../config");
class DHLProvider {
    constructor() {
        this.providerName = 'DHL';
        this.supportedCountries = [
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
        this.supportedServices = [
            'EXPRESS_WORLDWIDE',
            'EXPRESS_12:00',
            'EXPRESS_9:00',
            'ECONOMY_SELECT',
            'DOMESTIC_EXPRESS',
            'DOMESTIC_EXPRESS_12:00',
            'DOMESTIC_ECONOMY',
        ];
        this.apiClient = axios_1.default.create({
            baseURL: _config_1.shippingConfig.dhl.apiEndpoint,
            headers: {
                Authorization: `Bearer ${_config_1.shippingConfig.dhl.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        this.apiClient.interceptors.response.use(response => response, error => {
            if (error.response) {
                const { status, data } = error.response;
                throw new Error(`DHL API Error (${status}): ${data.message || 'Unknown error'}`);
            }
            throw error;
        });
    }
    convertAddressToDHL(address) {
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
    convertDimensionsToDHL(details) {
        const conversionFactor = details.dimensions.unit === 'in' ? 2.54 : 1;
        return {
            length: details.dimensions.length * conversionFactor,
            width: details.dimensions.width * conversionFactor,
            height: details.dimensions.height * conversionFactor,
            unit: 'cm',
        };
    }
    convertWeightToDHL(details) {
        const conversionFactor = details.weight.unit === 'lb' ? 0.453592 : 1;
        return {
            value: details.weight.value * conversionFactor,
            unit: 'kg',
        };
    }
    async validateAddress(address) {
        try {
            const response = await this.apiClient.post('/address-validation', {
                address: this.convertAddressToDHL(address),
            });
            return response.data.isValid === true;
        }
        catch (error) {
            console.error('DHL address validation error:', error);
            return false;
        }
    }
    async getRates(request) {
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
    async createShipment(details) {
        var _a;
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
                        currency: ((_a = details.declaredValue) === null || _a === void 0 ? void 0 : _a.currency) || 'USD',
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
    async cancelShipment(trackingNumber) {
        try {
            await this.apiClient.delete(`/shipments/${trackingNumber}`);
            return true;
        }
        catch (error) {
            console.error('DHL shipment cancellation error:', error);
            return false;
        }
    }
    async getTrackingInfo(trackingNumber) {
        const response = await this.apiClient.get(`/tracking/${trackingNumber}`);
        const latestEvent = response.data.shipments[0].events[0];
        const statusMap = {
            PU: shipping_interface_1.ShippingStatus.PICKED_UP,
            DF: shipping_interface_1.ShippingStatus.IN_TRANSIT,
            AF: shipping_interface_1.ShippingStatus.IN_TRANSIT,
            AR: shipping_interface_1.ShippingStatus.IN_TRANSIT,
            OH: shipping_interface_1.ShippingStatus.OUT_FOR_DELIVERY,
            OK: shipping_interface_1.ShippingStatus.DELIVERED,
            NH: shipping_interface_1.ShippingStatus.FAILED_ATTEMPT,
            RT: shipping_interface_1.ShippingStatus.RETURNED,
        };
        return {
            trackingNumber,
            status: statusMap[latestEvent.code] || shipping_interface_1.ShippingStatus.PENDING,
            location: `${latestEvent.location.city}, ${latestEvent.location.countryCode}`,
            timestamp: new Date(latestEvent.timestamp),
            description: latestEvent.description,
        };
    }
    async subscribeToTrackingUpdates(trackingNumber, callbackUrl) {
        try {
            await this.apiClient.post('/tracking/subscriptions', {
                trackingNumber,
                callbackUrl,
                events: ['pickup', 'delivery', 'movement', 'exception'],
            });
            return true;
        }
        catch (error) {
            console.error('DHL tracking subscription error:', error);
            return false;
        }
    }
    async generateLabel(trackingNumber) {
        const response = await this.apiClient.get(`/shipments/${trackingNumber}/label`);
        return response.data.url;
    }
    async validateLabel(labelUrl) {
        try {
            const response = await axios_1.default.head(labelUrl);
            return response.status === 200;
        }
        catch (error) {
            return false;
        }
    }
    async schedulePickup(trackingNumbers, pickupDetails) {
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
    async cancelPickup(confirmationNumber) {
        try {
            await this.apiClient.delete(`/pickups/${confirmationNumber}`);
            return true;
        }
        catch (error) {
            console.error('DHL pickup cancellation error:', error);
            return false;
        }
    }
    async validateCredentials() {
        try {
            await this.apiClient.get('/auth/test');
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async getServiceAreas() {
        const response = await this.apiClient.get('/service-areas');
        return response.data.serviceAreas.map(area => ({
            country: area.countryCode,
            postalCodes: area.postalCodes,
        }));
    }
    async estimateDeliveryDate(fromPostalCode, toPostalCode, serviceType) {
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
exports.default = DHLProvider;
//# sourceMappingURL=dhl-provider.js.map