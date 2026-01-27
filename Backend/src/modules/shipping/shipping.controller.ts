import { NextFunction, Request, Response } from 'express';
import { ShippingProvider, ShippingZone, ShippingRate, ShippingLabel, ShippingPackage } from '@/modules/shipping/shipping.interface';
import ShippingService from '@/modules/shipping/shipping.service';
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
import { ShipmentDetails } from './integrations/shipping-provider.interface';
class ShippingController {
  public shippingService = new ShippingService();
  public findAllProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providers: ShippingProvider[] = await this.shippingService.findAllProviders();
      res.status(200).json({ data: providers, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public findProviderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providerId: string = req.params.id;
      const provider: ShippingProvider = await this.shippingService.findProviderById(providerId);
      res.status(200).json({ data: provider, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public createProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providerData: CreateProviderDto = req.body;
      const provider: ShippingProvider = await this.shippingService.createProvider(providerData);
      res.status(201).json({ data: provider, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providerId: string = req.params.id;
      const providerData: UpdateProviderDto = req.body;
      const provider: ShippingProvider = await this.shippingService.updateProvider(providerId, providerData);
      res.status(200).json({ data: provider, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const providerId: string = req.params.id;
      const provider: ShippingProvider = await this.shippingService.deleteProvider(providerId);
      res.status(200).json({ data: provider, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public findAllZones = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const zones: ShippingZone[] = await this.shippingService.findAllZones();
      res.status(200).json({ data: zones, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public findZoneById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const zoneId: string = req.params.id;
      const zone: ShippingZone = await this.shippingService.findZoneById(zoneId);
      res.status(200).json({ data: zone, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public createZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const zoneData: CreateZoneDto = req.body;
      const zone: ShippingZone = await this.shippingService.createZone(zoneData);
      res.status(201).json({ data: zone, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const zoneId: string = req.params.id;
      const zoneData: UpdateZoneDto = req.body;
      const zone: ShippingZone = await this.shippingService.updateZone(zoneId, zoneData);
      res.status(200).json({ data: zone, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const zoneId: string = req.params.id;
      const zone: ShippingZone = await this.shippingService.deleteZone(zoneId);
      res.status(200).json({ data: zone, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public findAllRates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rates: ShippingRate[] = await this.shippingService.findAllRates();
      res.status(200).json({ data: rates, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public findRateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rateId: string = req.params.id;
      const rate: ShippingRate = await this.shippingService.findRateById(rateId);
      res.status(200).json({ data: rate, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public findRatesByZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const zoneId: string = req.params.zoneId;
      const rates: ShippingRate[] = await this.shippingService.findRatesByZone(zoneId);
      res.status(200).json({ data: rates, message: 'findByZone' });
    } catch (error) {
      next(error);
    }
  };
  public calculateShippingRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderData = req.body;
      const cost: number = await this.shippingService.calculateShippingRate(orderData);
      res.status(200).json({ data: { cost }, message: 'calculated' });
    } catch (error) {
      next(error);
    }
  };
  public createRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rateData: CreateRateDto = req.body;
      const rate: ShippingRate = await this.shippingService.createRate(rateData);
      res.status(201).json({ data: rate, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rateId: string = req.params.id;
      const rateData: UpdateRateDto = req.body;
      const rate: ShippingRate = await this.shippingService.updateRate(rateId, rateData);
      res.status(200).json({ data: rate, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteRate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rateId: string = req.params.id;
      const rate: ShippingRate = await this.shippingService.deleteRate(rateId);
      res.status(200).json({ data: rate, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public findAllLabels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const labels: ShippingLabel[] = await this.shippingService.findAllLabels();
      res.status(200).json({ data: labels, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public findLabelById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const labelId: string = req.params.id;
      const label: ShippingLabel = await this.shippingService.findLabelById(labelId);
      res.status(200).json({ data: label, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public findLabelByTrackingNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const trackingNumber: string = req.params.trackingNumber;
      const label: ShippingLabel = await this.shippingService.findLabelByTrackingNumber(trackingNumber);
      res.status(200).json({ data: label, message: 'findByTracking' });
    } catch (error) {
      next(error);
    }
  };
  public createLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const labelData: CreateLabelDto = req.body;
      const label: ShippingLabel = await this.shippingService.createLabel(labelData);
      res.status(201).json({ data: label, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const labelId: string = req.params.id;
      const labelData: UpdateLabelDto = req.body;
      const label: ShippingLabel = await this.shippingService.updateLabel(labelId, labelData);
      res.status(200).json({ data: label, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public addTrackingHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const labelId: string = req.params.id;
      const historyData: AddTrackingHistoryDto = req.body;
      const label: ShippingLabel = await this.shippingService.addTrackingHistory(labelId, historyData);
      res.status(200).json({ data: label, message: 'trackingAdded' });
    } catch (error) {
      next(error);
    }
  };
  public deleteLabel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const labelId: string = req.params.id;
      const label: ShippingLabel = await this.shippingService.deleteLabel(labelId);
      res.status(200).json({ data: label, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public findAllPackages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const packages: ShippingPackage[] = await this.shippingService.findAllPackages();
      res.status(200).json({ data: packages, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public findPackageById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const packageId: string = req.params.id;
      const pkg: ShippingPackage = await this.shippingService.findPackageById(packageId);
      res.status(200).json({ data: pkg, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public createPackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const packageData: CreatePackageDto = req.body;
      const pkg: ShippingPackage = await this.shippingService.createPackage(packageData);
      res.status(201).json({ data: pkg, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updatePackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const packageId: string = req.params.id;
      const packageData: UpdatePackageDto = req.body;
      const pkg: ShippingPackage = await this.shippingService.updatePackage(packageId, packageData);
      res.status(200).json({ data: pkg, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deletePackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const packageId: string = req.params.id;
      const pkg: ShippingPackage = await this.shippingService.deletePackage(packageId);
      res.status(200).json({ data: pkg, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public validateProviderCredentials = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providerId = String(req.params.id);
      const isValid = await this.shippingService.validateProviderCredentials(providerId);
      res.status(200).json({ data: isValid, message: 'Provider credentials validated' });
    } catch (error) {
      next(error);
    }
  };
  public getAvailableProviders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providers = await this.shippingService.getAvailableProviders();
      res.status(200).json({ data: providers, message: 'Available providers retrieved' });
    } catch (error) {
      next(error);
    }
  };
  public validateShippingAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providerId = String(req.params.id);
      const address = req.body;
      const isValid = await this.shippingService.validateShippingAddress(providerId, address);
      res.status(200).json({ data: isValid, message: 'Address validated' });
    } catch (error) {
      next(error);
    }
  };
  public getRatesFromProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providerId = String(req.params.id);
      const details: ShipmentDetails = req.body;
      const rates = await this.shippingService.getRatesFromProvider(providerId, details);
      res.status(200).json({ data: rates, message: 'Shipping rates retrieved' });
    } catch (error) {
      next(error);
    }
  };
  public createShipmentWithProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providerId = String(req.params.id);
      const details: ShipmentDetails = req.body;
      const label = await this.shippingService.createShipmentWithProvider(providerId, details);
      res.status(201).json({ data: label, message: 'Shipment created' });
    } catch (error) {
      next(error);
    }
  };
  public cancelShipmentWithProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const labelId = String(req.params.id);
      const cancelled = await this.shippingService.cancelShipmentWithProvider(labelId);
      res.status(200).json({ data: cancelled, message: 'Shipment cancelled' });
    } catch (error) {
      next(error);
    }
  };
  public updateTrackingInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const labelId = String(req.params.id);
      const label = await this.shippingService.updateTrackingInfo(labelId);
      res.status(200).json({ data: label, message: 'Tracking info updated' });
    } catch (error) {
      next(error);
    }
  };
  public subscribeToTrackingUpdates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const labelId = String(req.params.id);
      const { callbackUrl } = req.body;
      const subscribed = await this.shippingService.subscribeToTrackingUpdates(labelId, callbackUrl);
      res.status(200).json({ data: subscribed, message: 'Subscribed to tracking updates' });
    } catch (error) {
      next(error);
    }
  };
  public schedulePickup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { labelIds, pickupDetails } = req.body;
      const pickup = await this.shippingService.schedulePickup(labelIds, pickupDetails);
      res.status(201).json({ data: pickup, message: 'Pickup scheduled' });
    } catch (error) {
      next(error);
    }
  };
  public cancelPickup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providerId = String(req.params.providerId);
      const { confirmationNumber } = req.body;
      const cancelled = await this.shippingService.cancelPickup(providerId, confirmationNumber);
      res.status(200).json({ data: cancelled, message: 'Pickup cancelled' });
    } catch (error) {
      next(error);
    }
  };
  public estimateDeliveryDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providerId = String(req.params.id);
      const { fromPostalCode, toPostalCode, serviceType } = req.body;
      const estimate = await this.shippingService.estimateDeliveryDate(providerId, fromPostalCode, toPostalCode, serviceType);
      res.status(200).json({ data: estimate, message: 'Delivery date estimated' });
    } catch (error) {
      next(error);
    }
  };
}
export default ShippingController;