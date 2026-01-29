"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const shipping_controller_1 = tslib_1.__importDefault(require("../../modules/shipping/shipping.controller"));
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
const shipping_dto_1 = require("../../modules/shipping/shipping.dto");
class ShippingRoute {
    constructor() {
        this.path = '/shipping';
        this.router = (0, express_1.Router)();
        this.shippingController = new shipping_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/providers`, auth_middleware_1.default, this.shippingController.findAllProviders);
        this.router.get(`${this.path}/providers/:id`, auth_middleware_1.default, this.shippingController.findProviderById);
        this.router.post(`${this.path}/providers`, [auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.CreateProviderDto)], this.shippingController.createProvider);
        this.router.put(`${this.path}/providers/:id`, [auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.UpdateProviderDto)], this.shippingController.updateProvider);
        this.router.delete(`${this.path}/providers/:id`, auth_middleware_1.default, this.shippingController.deleteProvider);
        this.router.get(`${this.path}/providers/available`, auth_middleware_1.default, this.shippingController.getAvailableProviders);
        this.router.post(`${this.path}/providers/:id/validate-credentials`, auth_middleware_1.default, this.shippingController.validateProviderCredentials);
        this.router.post(`${this.path}/providers/:id/validate-address`, auth_middleware_1.default, this.shippingController.validateShippingAddress);
        this.router.post(`${this.path}/providers/:id/rates`, auth_middleware_1.default, this.shippingController.getRatesFromProvider);
        this.router.post(`${this.path}/providers/:id/shipments`, auth_middleware_1.default, this.shippingController.createShipmentWithProvider);
        this.router.delete(`${this.path}/shipments/:id`, auth_middleware_1.default, this.shippingController.cancelShipmentWithProvider);
        this.router.get(`${this.path}/shipments/:id/tracking`, auth_middleware_1.default, this.shippingController.updateTrackingInfo);
        this.router.post(`${this.path}/shipments/:id/tracking-subscription`, auth_middleware_1.default, this.shippingController.subscribeToTrackingUpdates);
        this.router.post(`${this.path}/pickups`, auth_middleware_1.default, this.shippingController.schedulePickup);
        this.router.delete(`${this.path}/providers/:providerId/pickups`, auth_middleware_1.default, this.shippingController.cancelPickup);
        this.router.post(`${this.path}/providers/:id/delivery-estimate`, auth_middleware_1.default, this.shippingController.estimateDeliveryDate);
        this.router.get(`${this.path}/zones`, auth_middleware_1.default, this.shippingController.findAllZones);
        this.router.get(`${this.path}/zones/:id`, auth_middleware_1.default, this.shippingController.findZoneById);
        this.router.post(`${this.path}/zones`, [auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.CreateZoneDto)], this.shippingController.createZone);
        this.router.put(`${this.path}/zones/:id`, [auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.UpdateZoneDto)], this.shippingController.updateZone);
        this.router.delete(`${this.path}/zones/:id`, auth_middleware_1.default, this.shippingController.deleteZone);
        this.router.get(`${this.path}/rates`, auth_middleware_1.default, this.shippingController.findAllRates);
        this.router.get(`${this.path}/rates/:id`, auth_middleware_1.default, this.shippingController.findRateById);
        this.router.post(`${this.path}/rates`, [auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.CreateRateDto)], this.shippingController.createRate);
        this.router.put(`${this.path}/rates/:id`, [auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.UpdateRateDto)], this.shippingController.updateRate);
        this.router.delete(`${this.path}/rates/:id`, auth_middleware_1.default, this.shippingController.deleteRate);
        this.router.get(`${this.path}/labels`, auth_middleware_1.default, this.shippingController.findAllLabels);
        this.router.get(`${this.path}/labels/:id`, auth_middleware_1.default, this.shippingController.findLabelById);
        this.router.post(`${this.path}/labels`, [auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.CreateLabelDto)], this.shippingController.createLabel);
        this.router.put(`${this.path}/labels/:id`, [auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.UpdateLabelDto)], this.shippingController.updateLabel);
        this.router.post(`${this.path}/labels/:id/tracking`, auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.AddTrackingHistoryDto), this.shippingController.addTrackingHistory);
        this.router.delete(`${this.path}/labels/:id`, auth_middleware_1.default, this.shippingController.deleteLabel);
        this.router.get(`${this.path}/packages`, auth_middleware_1.default, this.shippingController.findAllPackages);
        this.router.get(`${this.path}/packages/:id`, auth_middleware_1.default, this.shippingController.findPackageById);
        this.router.post(`${this.path}/packages`, [auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.CreatePackageDto)], this.shippingController.createPackage);
        this.router.put(`${this.path}/packages/:id`, [auth_middleware_1.default, (0, validation_middleware_1.default)(shipping_dto_1.UpdatePackageDto)], this.shippingController.updatePackage);
        this.router.delete(`${this.path}/packages/:id`, auth_middleware_1.default, this.shippingController.deletePackage);
    }
}
exports.default = ShippingRoute;
//# sourceMappingURL=shipping.route.js.map