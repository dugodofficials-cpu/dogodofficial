"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const shipping_service_1 = tslib_1.__importDefault(require("../../modules/shipping/shipping.service"));
class ShippingController {
    constructor() {
        this.shippingService = new shipping_service_1.default();
        this.findAllProviders = async (req, res, next) => {
            try {
                const providers = await this.shippingService.findAllProviders();
                res.status(200).json({ data: providers, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findProviderById = async (req, res, next) => {
            try {
                const providerId = req.params.id;
                const provider = await this.shippingService.findProviderById(providerId);
                res.status(200).json({ data: provider, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createProvider = async (req, res, next) => {
            try {
                const providerData = req.body;
                const provider = await this.shippingService.createProvider(providerData);
                res.status(201).json({ data: provider, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateProvider = async (req, res, next) => {
            try {
                const providerId = req.params.id;
                const providerData = req.body;
                const provider = await this.shippingService.updateProvider(providerId, providerData);
                res.status(200).json({ data: provider, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteProvider = async (req, res, next) => {
            try {
                const providerId = req.params.id;
                const provider = await this.shippingService.deleteProvider(providerId);
                res.status(200).json({ data: provider, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findAllZones = async (req, res, next) => {
            try {
                const zones = await this.shippingService.findAllZones();
                res.status(200).json({ data: zones, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findZoneById = async (req, res, next) => {
            try {
                const zoneId = req.params.id;
                const zone = await this.shippingService.findZoneById(zoneId);
                res.status(200).json({ data: zone, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createZone = async (req, res, next) => {
            try {
                const zoneData = req.body;
                const zone = await this.shippingService.createZone(zoneData);
                res.status(201).json({ data: zone, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateZone = async (req, res, next) => {
            try {
                const zoneId = req.params.id;
                const zoneData = req.body;
                const zone = await this.shippingService.updateZone(zoneId, zoneData);
                res.status(200).json({ data: zone, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteZone = async (req, res, next) => {
            try {
                const zoneId = req.params.id;
                const zone = await this.shippingService.deleteZone(zoneId);
                res.status(200).json({ data: zone, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findAllRates = async (req, res, next) => {
            try {
                const rates = await this.shippingService.findAllRates();
                res.status(200).json({ data: rates, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findRateById = async (req, res, next) => {
            try {
                const rateId = req.params.id;
                const rate = await this.shippingService.findRateById(rateId);
                res.status(200).json({ data: rate, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findRatesByZone = async (req, res, next) => {
            try {
                const zoneId = req.params.zoneId;
                const rates = await this.shippingService.findRatesByZone(zoneId);
                res.status(200).json({ data: rates, message: 'findByZone' });
            }
            catch (error) {
                next(error);
            }
        };
        this.calculateShippingRate = async (req, res, next) => {
            try {
                const orderData = req.body;
                const cost = await this.shippingService.calculateShippingRate(orderData);
                res.status(200).json({ data: { cost }, message: 'calculated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createRate = async (req, res, next) => {
            try {
                const rateData = req.body;
                const rate = await this.shippingService.createRate(rateData);
                res.status(201).json({ data: rate, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateRate = async (req, res, next) => {
            try {
                const rateId = req.params.id;
                const rateData = req.body;
                const rate = await this.shippingService.updateRate(rateId, rateData);
                res.status(200).json({ data: rate, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteRate = async (req, res, next) => {
            try {
                const rateId = req.params.id;
                const rate = await this.shippingService.deleteRate(rateId);
                res.status(200).json({ data: rate, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findAllLabels = async (req, res, next) => {
            try {
                const labels = await this.shippingService.findAllLabels();
                res.status(200).json({ data: labels, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findLabelById = async (req, res, next) => {
            try {
                const labelId = req.params.id;
                const label = await this.shippingService.findLabelById(labelId);
                res.status(200).json({ data: label, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findLabelByTrackingNumber = async (req, res, next) => {
            try {
                const trackingNumber = req.params.trackingNumber;
                const label = await this.shippingService.findLabelByTrackingNumber(trackingNumber);
                res.status(200).json({ data: label, message: 'findByTracking' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createLabel = async (req, res, next) => {
            try {
                const labelData = req.body;
                const label = await this.shippingService.createLabel(labelData);
                res.status(201).json({ data: label, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateLabel = async (req, res, next) => {
            try {
                const labelId = req.params.id;
                const labelData = req.body;
                const label = await this.shippingService.updateLabel(labelId, labelData);
                res.status(200).json({ data: label, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.addTrackingHistory = async (req, res, next) => {
            try {
                const labelId = req.params.id;
                const historyData = req.body;
                const label = await this.shippingService.addTrackingHistory(labelId, historyData);
                res.status(200).json({ data: label, message: 'trackingAdded' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteLabel = async (req, res, next) => {
            try {
                const labelId = req.params.id;
                const label = await this.shippingService.deleteLabel(labelId);
                res.status(200).json({ data: label, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findAllPackages = async (req, res, next) => {
            try {
                const packages = await this.shippingService.findAllPackages();
                res.status(200).json({ data: packages, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.findPackageById = async (req, res, next) => {
            try {
                const packageId = req.params.id;
                const pkg = await this.shippingService.findPackageById(packageId);
                res.status(200).json({ data: pkg, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createPackage = async (req, res, next) => {
            try {
                const packageData = req.body;
                const pkg = await this.shippingService.createPackage(packageData);
                res.status(201).json({ data: pkg, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePackage = async (req, res, next) => {
            try {
                const packageId = req.params.id;
                const packageData = req.body;
                const pkg = await this.shippingService.updatePackage(packageId, packageData);
                res.status(200).json({ data: pkg, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deletePackage = async (req, res, next) => {
            try {
                const packageId = req.params.id;
                const pkg = await this.shippingService.deletePackage(packageId);
                res.status(200).json({ data: pkg, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.validateProviderCredentials = async (req, res, next) => {
            try {
                const providerId = String(req.params.id);
                const isValid = await this.shippingService.validateProviderCredentials(providerId);
                res.status(200).json({ data: isValid, message: 'Provider credentials validated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getAvailableProviders = async (req, res, next) => {
            try {
                const providers = await this.shippingService.getAvailableProviders();
                res.status(200).json({ data: providers, message: 'Available providers retrieved' });
            }
            catch (error) {
                next(error);
            }
        };
        this.validateShippingAddress = async (req, res, next) => {
            try {
                const providerId = String(req.params.id);
                const address = req.body;
                const isValid = await this.shippingService.validateShippingAddress(providerId, address);
                res.status(200).json({ data: isValid, message: 'Address validated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getRatesFromProvider = async (req, res, next) => {
            try {
                const providerId = String(req.params.id);
                const details = req.body;
                const rates = await this.shippingService.getRatesFromProvider(providerId, details);
                res.status(200).json({ data: rates, message: 'Shipping rates retrieved' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createShipmentWithProvider = async (req, res, next) => {
            try {
                const providerId = String(req.params.id);
                const details = req.body;
                const label = await this.shippingService.createShipmentWithProvider(providerId, details);
                res.status(201).json({ data: label, message: 'Shipment created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.cancelShipmentWithProvider = async (req, res, next) => {
            try {
                const labelId = String(req.params.id);
                const cancelled = await this.shippingService.cancelShipmentWithProvider(labelId);
                res.status(200).json({ data: cancelled, message: 'Shipment cancelled' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTrackingInfo = async (req, res, next) => {
            try {
                const labelId = String(req.params.id);
                const label = await this.shippingService.updateTrackingInfo(labelId);
                res.status(200).json({ data: label, message: 'Tracking info updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.subscribeToTrackingUpdates = async (req, res, next) => {
            try {
                const labelId = String(req.params.id);
                const { callbackUrl } = req.body;
                const subscribed = await this.shippingService.subscribeToTrackingUpdates(labelId, callbackUrl);
                res.status(200).json({ data: subscribed, message: 'Subscribed to tracking updates' });
            }
            catch (error) {
                next(error);
            }
        };
        this.schedulePickup = async (req, res, next) => {
            try {
                const { labelIds, pickupDetails } = req.body;
                const pickup = await this.shippingService.schedulePickup(labelIds, pickupDetails);
                res.status(201).json({ data: pickup, message: 'Pickup scheduled' });
            }
            catch (error) {
                next(error);
            }
        };
        this.cancelPickup = async (req, res, next) => {
            try {
                const providerId = String(req.params.providerId);
                const { confirmationNumber } = req.body;
                const cancelled = await this.shippingService.cancelPickup(providerId, confirmationNumber);
                res.status(200).json({ data: cancelled, message: 'Pickup cancelled' });
            }
            catch (error) {
                next(error);
            }
        };
        this.estimateDeliveryDate = async (req, res, next) => {
            try {
                const providerId = String(req.params.id);
                const { fromPostalCode, toPostalCode, serviceType } = req.body;
                const estimate = await this.shippingService.estimateDeliveryDate(providerId, fromPostalCode, toPostalCode, serviceType);
                res.status(200).json({ data: estimate, message: 'Delivery date estimated' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = ShippingController;
//# sourceMappingURL=shipping.controller.js.map