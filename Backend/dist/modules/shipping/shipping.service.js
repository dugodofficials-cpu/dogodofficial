"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HttpException_1 = require("../../exceptions/HttpException");
const util_1 = require("../../utils/util");
const shipping_interface_1 = require("../../modules/shipping/shipping.interface");
const shipping_model_1 = require("../../modules/shipping/shipping.model");
const shipping_provider_factory_1 = tslib_1.__importDefault(require("./integrations/shipping-provider.factory"));
class ShippingService {
    constructor() {
        this.providers = shipping_model_1.ShippingProviderModel;
        this.zones = shipping_model_1.ShippingZoneModel;
        this.rates = shipping_model_1.ShippingRateModel;
        this.labels = shipping_model_1.ShippingLabelModel;
        this.packages = shipping_model_1.ShippingPackageModel;
    }
    isRegionOrPostalCodeInZone(zone, region, postalCode) {
        if (!zone.isActive)
            return false;
        if (region && zone.regions && zone.regions.length > 0) {
            if (zone.regions.includes(region)) {
                return true;
            }
        }
        if (postalCode && zone.postalCodes && zone.postalCodes.length > 0) {
            if (zone.postalCodes.includes(postalCode)) {
                return true;
            }
        }
        return false;
    }
    async findAllProviders() {
        return shipping_model_1.ShippingProviderModel.find().populate('supportedCountries');
    }
    async findProviderById(providerId) {
        if ((0, util_1.isEmpty)(providerId))
            throw new HttpException_1.HttpException(400, 'Provider ID is empty');
        const provider = await shipping_model_1.ShippingProviderModel.findById(providerId).populate('supportedCountries');
        if (!provider)
            throw new HttpException_1.HttpException(404, 'Provider not found');
        return provider;
    }
    async createProvider(providerData) {
        if ((0, util_1.isEmpty)(providerData))
            throw new HttpException_1.HttpException(400, 'Provider data is empty');
        const existingProvider = await shipping_model_1.ShippingProviderModel.findOne({ name: providerData.name });
        if (existingProvider)
            throw new HttpException_1.HttpException(409, `Provider ${providerData.name} already exists`);
        return shipping_model_1.ShippingProviderModel.create(providerData);
    }
    async updateProvider(providerId, providerData) {
        if ((0, util_1.isEmpty)(providerData))
            throw new HttpException_1.HttpException(400, 'Provider data is empty');
        if (providerData.name) {
            const existingProvider = await shipping_model_1.ShippingProviderModel.findOne({ name: providerData.name, _id: { $ne: providerId } });
            if (existingProvider)
                throw new HttpException_1.HttpException(409, `Provider ${providerData.name} already exists`);
        }
        const provider = await shipping_model_1.ShippingProviderModel.findByIdAndUpdate(providerId, providerData, { new: true }).populate('supportedCountries');
        if (!provider)
            throw new HttpException_1.HttpException(404, 'Provider not found');
        return provider;
    }
    async deleteProvider(providerId) {
        const provider = await shipping_model_1.ShippingProviderModel.findByIdAndDelete(providerId);
        if (!provider)
            throw new HttpException_1.HttpException(404, 'Provider not found');
        return provider;
    }
    async findAllZones() {
        return shipping_model_1.ShippingZoneModel.find().populate('countries');
    }
    async findZoneById(zoneId) {
        if ((0, util_1.isEmpty)(zoneId))
            throw new HttpException_1.HttpException(400, 'Zone ID is empty');
        const zone = await shipping_model_1.ShippingZoneModel.findById(zoneId).populate('countries');
        if (!zone)
            throw new HttpException_1.HttpException(404, 'Zone not found');
        return zone;
    }
    async createZone(zoneData) {
        if ((0, util_1.isEmpty)(zoneData))
            throw new HttpException_1.HttpException(400, 'Zone data is empty');
        return shipping_model_1.ShippingZoneModel.create(zoneData);
    }
    async updateZone(zoneId, zoneData) {
        if ((0, util_1.isEmpty)(zoneData))
            throw new HttpException_1.HttpException(400, 'Zone data is empty');
        const zone = await shipping_model_1.ShippingZoneModel.findByIdAndUpdate(zoneId, zoneData, { new: true }).populate('countries');
        if (!zone)
            throw new HttpException_1.HttpException(404, 'Zone not found');
        return zone;
    }
    async deleteZone(zoneId) {
        const zone = await shipping_model_1.ShippingZoneModel.findByIdAndDelete(zoneId);
        if (!zone)
            throw new HttpException_1.HttpException(404, 'Zone not found');
        return zone;
    }
    async findAllRates() {
        return shipping_model_1.ShippingRateModel.find().populate('provider').populate('zone');
    }
    async findRateById(rateId) {
        if ((0, util_1.isEmpty)(rateId))
            throw new HttpException_1.HttpException(400, 'Rate ID is empty');
        const rate = await shipping_model_1.ShippingRateModel.findById(rateId).populate('provider').populate('zone');
        if (!rate)
            throw new HttpException_1.HttpException(404, 'Rate not found');
        return rate;
    }
    async findRatesByZone(zoneId) {
        return shipping_model_1.ShippingRateModel.find({ zone: zoneId, isActive: true }).populate('provider').populate('zone');
    }
    async findRateByZone(region, postalCode) {
        const matchingZones = await shipping_model_1.ShippingZoneModel.find({
            isActive: true,
            $or: [
                { regions: { $in: [region] } },
                { postalCodes: { $in: [postalCode] } }
            ]
        });
        if (!matchingZones || matchingZones.length === 0) {
            return [];
        }
        return matchingZones;
    }
    async calculateShippingRate(shippingDetails) {
        const { address } = shippingDetails;
        const rates = await this.findRateByZone(address.city || address.state, address.postalCode);
        if (!rates || rates.length === 0) {
            return 20000;
        }
        return rates[0].rate;
    }
    async createRate(rateData) {
        if ((0, util_1.isEmpty)(rateData))
            throw new HttpException_1.HttpException(400, 'Rate data is empty');
        const existingRate = await shipping_model_1.ShippingRateModel.findOne({
            provider: rateData.provider,
            zone: rateData.zone,
            method: rateData.method,
        });
        if (existingRate)
            throw new HttpException_1.HttpException(409, 'Rate already exists for this provider, zone, and method');
        return shipping_model_1.ShippingRateModel.create(rateData);
    }
    async updateRate(rateId, rateData) {
        if ((0, util_1.isEmpty)(rateData))
            throw new HttpException_1.HttpException(400, 'Rate data is empty');
        const rate = await shipping_model_1.ShippingRateModel.findByIdAndUpdate(rateId, rateData, { new: true }).populate('provider').populate('zone');
        if (!rate)
            throw new HttpException_1.HttpException(404, 'Rate not found');
        return rate;
    }
    async deleteRate(rateId) {
        const rate = await shipping_model_1.ShippingRateModel.findByIdAndDelete(rateId);
        if (!rate)
            throw new HttpException_1.HttpException(404, 'Rate not found');
        return rate;
    }
    async findAllLabels() {
        return shipping_model_1.ShippingLabelModel.find().populate('provider');
    }
    async findLabelById(labelId) {
        if ((0, util_1.isEmpty)(labelId))
            throw new HttpException_1.HttpException(400, 'Label ID is empty');
        const label = await shipping_model_1.ShippingLabelModel.findById(labelId).populate('provider');
        if (!label)
            throw new HttpException_1.HttpException(404, 'Label not found');
        return label;
    }
    async findLabelByTrackingNumber(trackingNumber) {
        const label = await shipping_model_1.ShippingLabelModel.findOne({ trackingNumber }).populate('provider');
        if (!label)
            throw new HttpException_1.HttpException(404, 'Label not found');
        return label;
    }
    async createLabel(labelData) {
        if ((0, util_1.isEmpty)(labelData))
            throw new HttpException_1.HttpException(400, 'Label data is empty');
        const existingLabel = await shipping_model_1.ShippingLabelModel.findOne({ trackingNumber: labelData.trackingNumber });
        if (existingLabel)
            throw new HttpException_1.HttpException(409, 'Label with this tracking number already exists');
        return shipping_model_1.ShippingLabelModel.create(labelData);
    }
    async updateLabel(labelId, labelData) {
        if ((0, util_1.isEmpty)(labelData))
            throw new HttpException_1.HttpException(400, 'Label data is empty');
        const label = await shipping_model_1.ShippingLabelModel.findByIdAndUpdate(labelId, labelData, { new: true }).populate('provider');
        if (!label)
            throw new HttpException_1.HttpException(404, 'Label not found');
        return label;
    }
    async addTrackingHistory(labelId, historyData) {
        if ((0, util_1.isEmpty)(historyData))
            throw new HttpException_1.HttpException(400, 'Tracking history data is empty');
        const label = await shipping_model_1.ShippingLabelModel.findById(labelId);
        if (!label)
            throw new HttpException_1.HttpException(404, 'Label not found');
        const trackingEntry = Object.assign(Object.assign({}, historyData), { timestamp: new Date() });
        label.trackingHistory.push(trackingEntry);
        label.status = historyData.status;
        if (historyData.status === shipping_interface_1.ShippingStatus.DELIVERED) {
            label.actualDeliveryDate = new Date();
        }
        return label.save();
    }
    async deleteLabel(labelId) {
        const label = await shipping_model_1.ShippingLabelModel.findByIdAndDelete(labelId);
        if (!label)
            throw new HttpException_1.HttpException(404, 'Label not found');
        return label;
    }
    async findAllPackages() {
        return shipping_model_1.ShippingPackageModel.find();
    }
    async findPackageById(packageId) {
        if ((0, util_1.isEmpty)(packageId))
            throw new HttpException_1.HttpException(400, 'Package ID is empty');
        const pkg = await shipping_model_1.ShippingPackageModel.findById(packageId);
        if (!pkg)
            throw new HttpException_1.HttpException(404, 'Package not found');
        return pkg;
    }
    async createPackage(packageData) {
        if ((0, util_1.isEmpty)(packageData))
            throw new HttpException_1.HttpException(400, 'Package data is empty');
        return shipping_model_1.ShippingPackageModel.create(packageData);
    }
    async updatePackage(packageId, packageData) {
        if ((0, util_1.isEmpty)(packageData))
            throw new HttpException_1.HttpException(400, 'Package data is empty');
        const pkg = await shipping_model_1.ShippingPackageModel.findByIdAndUpdate(packageId, packageData, { new: true });
        if (!pkg)
            throw new HttpException_1.HttpException(404, 'Package not found');
        return pkg;
    }
    async deletePackage(packageId) {
        const pkg = await shipping_model_1.ShippingPackageModel.findByIdAndDelete(packageId);
        if (!pkg)
            throw new HttpException_1.HttpException(404, 'Package not found');
        return pkg;
    }
    async validateProviderCredentials(providerId) {
        const provider = await this.findProviderById(providerId);
        return shipping_provider_factory_1.default.validateProvider(provider.name);
    }
    async getAvailableProviders() {
        return shipping_provider_factory_1.default.getAvailableProviders();
    }
    async validateShippingAddress(providerId, address) {
        const provider = await this.findProviderById(providerId);
        const providerAPI = shipping_provider_factory_1.default.getProvider(provider.name);
        return providerAPI.validateAddress(address);
    }
    async getRatesFromProvider(providerId, details) {
        const provider = await this.findProviderById(providerId);
        const providerAPI = shipping_provider_factory_1.default.getProvider(provider.name);
        return providerAPI.getRates({ shipmentDetails: details });
    }
    async createShipmentWithProvider(providerId, details) {
        const provider = await this.findProviderById(providerId);
        const providerAPI = shipping_provider_factory_1.default.getProvider(provider.name);
        const shipmentResponse = await providerAPI.createShipment(details);
        const labelData = {
            provider: providerId,
            trackingNumber: shipmentResponse.trackingNumber,
            trackingUrl: shipmentResponse.trackingUrl,
            labelUrl: shipmentResponse.labelUrl,
            cost: shipmentResponse.rate.amount,
            currency: shipmentResponse.rate.currency,
            weight: details.weight.value,
            weightUnit: details.weight.unit,
            dimensions: {
                length: details.dimensions.length,
                width: details.dimensions.width,
                height: details.dimensions.height,
                unit: details.dimensions.unit,
            },
            fromAddress: details.fromAddress,
            toAddress: details.toAddress,
            estimatedDeliveryDate: shipmentResponse.estimatedDelivery,
        };
        return this.createLabel(labelData);
    }
    async cancelShipmentWithProvider(labelId) {
        const label = await this.findLabelById(labelId);
        const provider = await this.findProviderById(label.provider);
        const providerAPI = shipping_provider_factory_1.default.getProvider(provider.name);
        const cancelled = await providerAPI.cancelShipment(label.trackingNumber);
        if (cancelled) {
            await this.deleteLabel(labelId);
        }
        return cancelled;
    }
    async updateTrackingInfo(labelId) {
        const label = await this.findLabelById(labelId);
        const provider = await this.findProviderById(label.provider);
        const providerAPI = shipping_provider_factory_1.default.getProvider(provider.name);
        const trackingInfo = await providerAPI.getTrackingInfo(label.trackingNumber);
        const historyData = {
            status: trackingInfo.status,
            location: trackingInfo.location,
            description: trackingInfo.description,
        };
        return this.addTrackingHistory(labelId, historyData);
    }
    async subscribeToTrackingUpdates(labelId, callbackUrl) {
        const label = await this.findLabelById(labelId);
        const provider = await this.findProviderById(label.provider);
        const providerAPI = shipping_provider_factory_1.default.getProvider(provider.name);
        return providerAPI.subscribeToTrackingUpdates(label.trackingNumber, callbackUrl);
    }
    async schedulePickup(labelIds, pickupDetails) {
        const labels = await Promise.all(labelIds.map(id => this.findLabelById(id)));
        const providerId = labels[0].provider;
        if (!labels.every(label => label.provider === providerId)) {
            throw new HttpException_1.HttpException(400, 'All labels must be from the same provider for pickup');
        }
        const provider = await this.findProviderById(providerId);
        const providerAPI = shipping_provider_factory_1.default.getProvider(provider.name);
        return providerAPI.schedulePickup(labels.map(label => label.trackingNumber), pickupDetails);
    }
    async cancelPickup(providerId, confirmationNumber) {
        const provider = await this.findProviderById(providerId);
        const providerAPI = shipping_provider_factory_1.default.getProvider(provider.name);
        return providerAPI.cancelPickup(confirmationNumber);
    }
    async estimateDeliveryDate(providerId, fromPostalCode, toPostalCode, serviceType) {
        const provider = await this.findProviderById(providerId);
        const providerAPI = shipping_provider_factory_1.default.getProvider(provider.name);
        return providerAPI.estimateDeliveryDate(fromPostalCode, toPostalCode, serviceType);
    }
}
exports.default = ShippingService;
//# sourceMappingURL=shipping.service.js.map