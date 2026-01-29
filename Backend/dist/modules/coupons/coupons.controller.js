"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const coupons_service_1 = tslib_1.__importDefault(require("../../modules/coupons/coupons.service"));
class CouponController {
    constructor() {
        this.couponService = new coupons_service_1.default();
        this.getCoupons = async (req, res, next) => {
            try {
                const findAllCouponsData = await this.couponService.findAllCoupons();
                res.status(200).json({ data: findAllCouponsData, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getCouponById = async (req, res, next) => {
            try {
                const couponId = req.params.id;
                const findOneCouponData = await this.couponService.findCouponById(couponId);
                res.status(200).json({ data: findOneCouponData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getCouponByCode = async (req, res, next) => {
            try {
                const code = req.params.code;
                const findOneCouponData = await this.couponService.findCouponByCode(code);
                res.status(200).json({ data: findOneCouponData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createCoupon = async (req, res, next) => {
            try {
                const couponData = req.body;
                const createCouponData = await this.couponService.createCoupon(couponData);
                res.status(201).json({ data: createCouponData, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateCoupon = async (req, res, next) => {
            try {
                const couponId = req.params.id;
                const couponData = req.body;
                const updateCouponData = await this.couponService.updateCoupon(couponId, couponData);
                res.status(200).json({ data: updateCouponData, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteCoupon = async (req, res, next) => {
            try {
                const couponId = req.params.id;
                const deleteCouponData = await this.couponService.deleteCoupon(couponId);
                res.status(200).json({ data: deleteCouponData, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.validateCoupon = async (req, res, next) => {
            try {
                const validationData = req.body;
                const validationResult = await this.couponService.validateCoupon(validationData);
                res.status(200).json({ data: validationResult, message: 'validated' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = CouponController;
//# sourceMappingURL=coupons.controller.js.map