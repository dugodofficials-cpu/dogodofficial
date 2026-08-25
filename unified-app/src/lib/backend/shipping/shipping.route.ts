import { Router } from 'express';
import { Routes } from '@backend/interfaces/routes.interface';
import ShippingController from '@backend/shipping/shipping.controller';
import validationMiddleware from '@backend/middlewares/validation.middleware';
import authMiddleware from '@backend/middlewares/auth.middleware';
import { hasPermission } from '@backend/middlewares/permission.middleware';
import { Permission } from '@backend/roles/roles.interface';
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
} from '@backend/shipping/shipping.dto';
class ShippingRoute implements Routes {
  public path = '/shipping';
  public router = Router();
  public shippingController = new ShippingController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    const manage = hasPermission(Permission.MANAGE_SHIPPING_LOCATIONS);
    this.router.get(`${this.path}/providers`, authMiddleware, this.shippingController.findAllProviders);
    this.router.get(`${this.path}/providers/:id`, authMiddleware, this.shippingController.findProviderById);
    this.router.post(`${this.path}/providers`, [authMiddleware, manage, validationMiddleware(CreateProviderDto)], this.shippingController.createProvider);
    this.router.put(`${this.path}/providers/:id`, [authMiddleware, manage, validationMiddleware(UpdateProviderDto)], this.shippingController.updateProvider);
    this.router.delete(`${this.path}/providers/:id`, [authMiddleware, manage], this.shippingController.deleteProvider);
    this.router.get(`${this.path}/providers/available`, authMiddleware, this.shippingController.getAvailableProviders);
    this.router.post(`${this.path}/providers/:id/validate-credentials`, [authMiddleware, manage], this.shippingController.validateProviderCredentials);
    this.router.post(`${this.path}/providers/:id/validate-address`, authMiddleware, this.shippingController.validateShippingAddress);
    this.router.post(`${this.path}/providers/:id/rates`, authMiddleware, this.shippingController.getRatesFromProvider);
    this.router.post(`${this.path}/providers/:id/shipments`, [authMiddleware, manage], this.shippingController.createShipmentWithProvider);
    this.router.delete(`${this.path}/shipments/:id`, [authMiddleware, manage], this.shippingController.cancelShipmentWithProvider);
    this.router.get(`${this.path}/shipments/:id/tracking`, authMiddleware, this.shippingController.updateTrackingInfo);
    this.router.post(`${this.path}/shipments/:id/tracking-subscription`, [authMiddleware, manage], this.shippingController.subscribeToTrackingUpdates);
    this.router.post(`${this.path}/pickups`, [authMiddleware, manage], this.shippingController.schedulePickup);
    this.router.delete(`${this.path}/providers/:providerId/pickups`, [authMiddleware, manage], this.shippingController.cancelPickup);
    this.router.post(`${this.path}/providers/:id/delivery-estimate`, authMiddleware, this.shippingController.estimateDeliveryDate);
    this.router.get(`${this.path}/zones`, authMiddleware, this.shippingController.findAllZones);
    this.router.get(`${this.path}/zones/:id`, authMiddleware, this.shippingController.findZoneById);
    this.router.post(`${this.path}/zones`, [authMiddleware, manage, validationMiddleware(CreateZoneDto)], this.shippingController.createZone);
    this.router.put(`${this.path}/zones/:id`, [authMiddleware, manage, validationMiddleware(UpdateZoneDto)], this.shippingController.updateZone);
    this.router.delete(`${this.path}/zones/:id`, [authMiddleware, manage], this.shippingController.deleteZone);
    this.router.get(`${this.path}/rates`, authMiddleware, this.shippingController.findAllRates);
    this.router.get(`${this.path}/rates/:id`, authMiddleware, this.shippingController.findRateById);
    this.router.post(`${this.path}/rates`, [authMiddleware, manage, validationMiddleware(CreateRateDto)], this.shippingController.createRate);
    this.router.put(`${this.path}/rates/:id`, [authMiddleware, manage, validationMiddleware(UpdateRateDto)], this.shippingController.updateRate);
    this.router.delete(`${this.path}/rates/:id`, [authMiddleware, manage], this.shippingController.deleteRate);
    this.router.get(`${this.path}/labels`, authMiddleware, this.shippingController.findAllLabels);
    this.router.get(`${this.path}/labels/:id`, authMiddleware, this.shippingController.findLabelById);
    this.router.post(`${this.path}/labels`, [authMiddleware, manage, validationMiddleware(CreateLabelDto)], this.shippingController.createLabel);
    this.router.put(`${this.path}/labels/:id`, [authMiddleware, manage, validationMiddleware(UpdateLabelDto)], this.shippingController.updateLabel);
    this.router.post(
      `${this.path}/labels/:id/tracking`,
      [authMiddleware, manage],
      validationMiddleware(AddTrackingHistoryDto),
      this.shippingController.addTrackingHistory,
    );
    this.router.delete(`${this.path}/labels/:id`, [authMiddleware, manage], this.shippingController.deleteLabel);
    this.router.get(`${this.path}/packages`, authMiddleware, this.shippingController.findAllPackages);
    this.router.get(`${this.path}/packages/:id`, authMiddleware, this.shippingController.findPackageById);
    this.router.post(`${this.path}/packages`, [authMiddleware, manage, validationMiddleware(CreatePackageDto)], this.shippingController.createPackage);
    this.router.put(`${this.path}/packages/:id`, [authMiddleware, manage, validationMiddleware(UpdatePackageDto)], this.shippingController.updatePackage);
    this.router.delete(`${this.path}/packages/:id`, [authMiddleware, manage], this.shippingController.deletePackage);
  }
}
export default ShippingRoute;
