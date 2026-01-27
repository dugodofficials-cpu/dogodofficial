import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { ShippingProvider, ShippingZone, ShippingRate, ShippingLabel, ShippingPackage, ShippingStatus } from '@/modules/shipping/shipping.interface';
import {
  ShippingProviderModel,
  ShippingZoneModel,
  ShippingRateModel,
  ShippingLabelModel,
  ShippingPackageModel,
} from '@/modules/shipping/shipping.model';
import {
  CreateProviderDto,
  UpdateProviderDto,
  CreateZoneDto,
  UpdateZoneDto,
  CreateRateDto,
  UpdateRateDto,
  CreateLabelDto,
  UpdateLabelDto,
  AddTrackingHistoryDto,
  CreatePackageDto,
  UpdatePackageDto,
} from '@/modules/shipping/shipping.dto';
import ShippingProviderFactory, { ProviderType } from './integrations/shipping-provider.factory';
import { ShipmentDetails } from './integrations/shipping-provider.interface';
import { Order } from '../orders/orders.interface';
import { ShippingDetailsDto } from '../orders/orders.dto';
class ShippingService {
  public providers = ShippingProviderModel;
  public zones = ShippingZoneModel;
  public rates = ShippingRateModel;
  public labels = ShippingLabelModel;
  public packages = ShippingPackageModel;
  public isRegionOrPostalCodeInZone(zone: ShippingZone, region?: string, postalCode?: string): boolean {
    if (!zone.isActive) return false;
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
  public async findAllProviders(): Promise<ShippingProvider[]> {
    return ShippingProviderModel.find().populate('supportedCountries');
  }
  public async findProviderById(providerId: string): Promise<ShippingProvider> {
    if (isEmpty(providerId)) throw new HttpException(400, 'Provider ID is empty');
    const provider = await ShippingProviderModel.findById(providerId).populate('supportedCountries');
    if (!provider) throw new HttpException(404, 'Provider not found');
    return provider;
  }
  public async createProvider(providerData: CreateProviderDto): Promise<ShippingProvider> {
    if (isEmpty(providerData)) throw new HttpException(400, 'Provider data is empty');
    const existingProvider = await ShippingProviderModel.findOne({ name: providerData.name });
    if (existingProvider) throw new HttpException(409, `Provider ${providerData.name} already exists`);
    return ShippingProviderModel.create(providerData);
  }
  public async updateProvider(providerId: string, providerData: UpdateProviderDto): Promise<ShippingProvider> {
    if (isEmpty(providerData)) throw new HttpException(400, 'Provider data is empty');
    if (providerData.name) {
      const existingProvider = await ShippingProviderModel.findOne({ name: providerData.name, _id: { $ne: providerId } });
      if (existingProvider) throw new HttpException(409, `Provider ${providerData.name} already exists`);
    }
    const provider = await ShippingProviderModel.findByIdAndUpdate(providerId, providerData, { new: true }).populate('supportedCountries');
    if (!provider) throw new HttpException(404, 'Provider not found');
    return provider;
  }
  public async deleteProvider(providerId: string): Promise<ShippingProvider> {
    const provider = await ShippingProviderModel.findByIdAndDelete(providerId);
    if (!provider) throw new HttpException(404, 'Provider not found');
    return provider;
  }
  public async findAllZones(): Promise<ShippingZone[]> {
    return ShippingZoneModel.find().populate('countries');
  }
  public async findZoneById(zoneId: string): Promise<ShippingZone> {
    if (isEmpty(zoneId)) throw new HttpException(400, 'Zone ID is empty');
    const zone = await ShippingZoneModel.findById(zoneId).populate('countries');
    if (!zone) throw new HttpException(404, 'Zone not found');
    return zone;
  }
  public async createZone(zoneData: CreateZoneDto): Promise<ShippingZone> {
    if (isEmpty(zoneData)) throw new HttpException(400, 'Zone data is empty');
    return ShippingZoneModel.create(zoneData);
  }
  public async updateZone(zoneId: string, zoneData: UpdateZoneDto): Promise<ShippingZone> {
    if (isEmpty(zoneData)) throw new HttpException(400, 'Zone data is empty');
    const zone = await ShippingZoneModel.findByIdAndUpdate(zoneId, zoneData, { new: true }).populate('countries');
    if (!zone) throw new HttpException(404, 'Zone not found');
    return zone;
  }
  public async deleteZone(zoneId: string): Promise<ShippingZone> {
    const zone = await ShippingZoneModel.findByIdAndDelete(zoneId);
    if (!zone) throw new HttpException(404, 'Zone not found');
    return zone;
  }
  public async findAllRates(): Promise<ShippingRate[]> {
    return ShippingRateModel.find().populate('provider').populate('zone');
  }
  public async findRateById(rateId: string): Promise<ShippingRate> {
    if (isEmpty(rateId)) throw new HttpException(400, 'Rate ID is empty');
    const rate = await ShippingRateModel.findById(rateId).populate('provider').populate('zone');
    if (!rate) throw new HttpException(404, 'Rate not found');
    return rate;
  }
  public async findRatesByZone(zoneId: string): Promise<ShippingRate[]> {
    return ShippingRateModel.find({ zone: zoneId, isActive: true }).populate('provider').populate('zone');
  }
  public async findRateByZone(region: string, postalCode: string): Promise<ShippingZone[]> {
    const matchingZones = await ShippingZoneModel.find({
      isActive: true,
      $or: [
        { regions: { $in: [region] } },
        { postalCodes: { $in: [postalCode] } }
      ]
    })
    if (!matchingZones || matchingZones.length === 0) {
      return [];
    }
    return matchingZones;
  }
  public async calculateShippingRate(shippingDetails: ShippingDetailsDto): Promise<number> {
    const { address } = shippingDetails;
    const rates = await this.findRateByZone(
      address.city || address.state,
      address.postalCode
    );
    if (!rates || rates.length === 0) {
      return 20000;
    }
    return rates[0].rate;
  }
  public async createRate(rateData: CreateRateDto): Promise<ShippingRate> {
    if (isEmpty(rateData)) throw new HttpException(400, 'Rate data is empty');
    const existingRate = await ShippingRateModel.findOne({
      provider: rateData.provider,
      zone: rateData.zone,
      method: rateData.method,
    });
    if (existingRate) throw new HttpException(409, 'Rate already exists for this provider, zone, and method');
    return ShippingRateModel.create(rateData);
  }
  public async updateRate(rateId: string, rateData: UpdateRateDto): Promise<ShippingRate> {
    if (isEmpty(rateData)) throw new HttpException(400, 'Rate data is empty');
    const rate = await ShippingRateModel.findByIdAndUpdate(rateId, rateData, { new: true }).populate('provider').populate('zone');
    if (!rate) throw new HttpException(404, 'Rate not found');
    return rate;
  }
  public async deleteRate(rateId: string): Promise<ShippingRate> {
    const rate = await ShippingRateModel.findByIdAndDelete(rateId);
    if (!rate) throw new HttpException(404, 'Rate not found');
    return rate;
  }
  public async findAllLabels(): Promise<ShippingLabel[]> {
    return ShippingLabelModel.find().populate('provider');
  }
  public async findLabelById(labelId: string): Promise<ShippingLabel> {
    if (isEmpty(labelId)) throw new HttpException(400, 'Label ID is empty');
    const label = await ShippingLabelModel.findById(labelId).populate('provider');
    if (!label) throw new HttpException(404, 'Label not found');
    return label;
  }
  public async findLabelByTrackingNumber(trackingNumber: string): Promise<ShippingLabel> {
    const label = await ShippingLabelModel.findOne({ trackingNumber }).populate('provider');
    if (!label) throw new HttpException(404, 'Label not found');
    return label;
  }
  public async createLabel(labelData: CreateLabelDto): Promise<ShippingLabel> {
    if (isEmpty(labelData)) throw new HttpException(400, 'Label data is empty');
    const existingLabel = await ShippingLabelModel.findOne({ trackingNumber: labelData.trackingNumber });
    if (existingLabel) throw new HttpException(409, 'Label with this tracking number already exists');
    return ShippingLabelModel.create(labelData);
  }
  public async updateLabel(labelId: string, labelData: UpdateLabelDto): Promise<ShippingLabel> {
    if (isEmpty(labelData)) throw new HttpException(400, 'Label data is empty');
    const label = await ShippingLabelModel.findByIdAndUpdate(labelId, labelData, { new: true }).populate('provider');
    if (!label) throw new HttpException(404, 'Label not found');
    return label;
  }
  public async addTrackingHistory(labelId: string, historyData: AddTrackingHistoryDto): Promise<ShippingLabel> {
    if (isEmpty(historyData)) throw new HttpException(400, 'Tracking history data is empty');
    const label = await ShippingLabelModel.findById(labelId);
    if (!label) throw new HttpException(404, 'Label not found');
    const trackingEntry = {
      ...historyData,
      timestamp: new Date(),
    };
    label.trackingHistory.push(trackingEntry);
    label.status = historyData.status;
    if (historyData.status === ShippingStatus.DELIVERED) {
      label.actualDeliveryDate = new Date();
    }
    return label.save();
  }
  public async deleteLabel(labelId: string): Promise<ShippingLabel> {
    const label = await ShippingLabelModel.findByIdAndDelete(labelId);
    if (!label) throw new HttpException(404, 'Label not found');
    return label;
  }
  public async findAllPackages(): Promise<ShippingPackage[]> {
    return ShippingPackageModel.find();
  }
  public async findPackageById(packageId: string): Promise<ShippingPackage> {
    if (isEmpty(packageId)) throw new HttpException(400, 'Package ID is empty');
    const pkg = await ShippingPackageModel.findById(packageId);
    if (!pkg) throw new HttpException(404, 'Package not found');
    return pkg;
  }
  public async createPackage(packageData: CreatePackageDto): Promise<ShippingPackage> {
    if (isEmpty(packageData)) throw new HttpException(400, 'Package data is empty');
    return ShippingPackageModel.create(packageData);
  }
  public async updatePackage(packageId: string, packageData: UpdatePackageDto): Promise<ShippingPackage> {
    if (isEmpty(packageData)) throw new HttpException(400, 'Package data is empty');
    const pkg = await ShippingPackageModel.findByIdAndUpdate(packageId, packageData, { new: true });
    if (!pkg) throw new HttpException(404, 'Package not found');
    return pkg;
  }
  public async deletePackage(packageId: string): Promise<ShippingPackage> {
    const pkg = await ShippingPackageModel.findByIdAndDelete(packageId);
    if (!pkg) throw new HttpException(404, 'Package not found');
    return pkg;
  }
  public async validateProviderCredentials(providerId: string): Promise<boolean> {
    const provider = await this.findProviderById(providerId);
    return ShippingProviderFactory.validateProvider(provider.name as ProviderType);
  }
  public async getAvailableProviders(): Promise<string[]> {
    return ShippingProviderFactory.getAvailableProviders();
  }
  public async validateShippingAddress(
    providerId: string,
    address: {
      name: string;
      company?: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
      email?: string;
    },
  ): Promise<boolean> {
    const provider = await this.findProviderById(providerId);
    const providerAPI = ShippingProviderFactory.getProvider(provider.name as ProviderType);
    return providerAPI.validateAddress(address);
  }
  public async getRatesFromProvider(
    providerId: string,
    details: ShipmentDetails,
  ): Promise<
    {
      provider: string;
      service: string;
      rate: {
        amount: number;
        currency: string;
      };
      estimatedDays: number;
      guaranteedDelivery: boolean;
    }[]
  > {
    const provider = await this.findProviderById(providerId);
    const providerAPI = ShippingProviderFactory.getProvider(provider.name as ProviderType);
    return providerAPI.getRates({ shipmentDetails: details });
  }
  public async createShipmentWithProvider(providerId: string, details: ShipmentDetails): Promise<ShippingLabel> {
    const provider = await this.findProviderById(providerId);
    const providerAPI = ShippingProviderFactory.getProvider(provider.name as ProviderType);
    const shipmentResponse = await providerAPI.createShipment(details);
    const labelData: CreateLabelDto = {
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
  public async cancelShipmentWithProvider(labelId: string): Promise<boolean> {
    const label = await this.findLabelById(labelId);
    const provider = await this.findProviderById(label.provider as string);
    const providerAPI = ShippingProviderFactory.getProvider(provider.name as ProviderType);
    const cancelled = await providerAPI.cancelShipment(label.trackingNumber);
    if (cancelled) {
      await this.deleteLabel(labelId);
    }
    return cancelled;
  }
  public async updateTrackingInfo(labelId: string): Promise<ShippingLabel> {
    const label = await this.findLabelById(labelId);
    const provider = await this.findProviderById(label.provider as string);
    const providerAPI = ShippingProviderFactory.getProvider(provider.name as ProviderType);
    const trackingInfo = await providerAPI.getTrackingInfo(label.trackingNumber);
    const historyData: AddTrackingHistoryDto = {
      status: trackingInfo.status,
      location: trackingInfo.location,
      description: trackingInfo.description,
    };
    return this.addTrackingHistory(labelId, historyData);
  }
  public async subscribeToTrackingUpdates(labelId: string, callbackUrl: string): Promise<boolean> {
    const label = await this.findLabelById(labelId);
    const provider = await this.findProviderById(label.provider as string);
    const providerAPI = ShippingProviderFactory.getProvider(provider.name as ProviderType);
    return providerAPI.subscribeToTrackingUpdates(label.trackingNumber, callbackUrl);
  }
  public async schedulePickup(
    labelIds: string[],
    pickupDetails: {
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
  }> {
    const labels = await Promise.all(labelIds.map(id => this.findLabelById(id)));
    const providerId = labels[0].provider as string;
    if (!labels.every(label => label.provider === providerId)) {
      throw new HttpException(400, 'All labels must be from the same provider for pickup');
    }
    const provider = await this.findProviderById(providerId);
    const providerAPI = ShippingProviderFactory.getProvider(provider.name as ProviderType);
    return providerAPI.schedulePickup(
      labels.map(label => label.trackingNumber),
      pickupDetails,
    );
  }
  public async cancelPickup(providerId: string, confirmationNumber: string): Promise<boolean> {
    const provider = await this.findProviderById(providerId);
    const providerAPI = ShippingProviderFactory.getProvider(provider.name as ProviderType);
    return providerAPI.cancelPickup(confirmationNumber);
  }
  public async estimateDeliveryDate(
    providerId: string,
    fromPostalCode: string,
    toPostalCode: string,
    serviceType: string,
  ): Promise<{
    estimatedDate: Date;
    guaranteedDelivery: boolean;
  }> {
    const provider = await this.findProviderById(providerId);
    const providerAPI = ShippingProviderFactory.getProvider(provider.name as ProviderType);
    return providerAPI.estimateDeliveryDate(fromPostalCode, toPostalCode, serviceType);
  }
}
export default ShippingService;