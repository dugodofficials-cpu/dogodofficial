"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HttpException_1 = require("../../exceptions/HttpException");
const coupons_interface_1 = require("./coupons.interface");
const coupons_model_1 = tslib_1.__importDefault(require("./coupons.model"));
const util_1 = require("../../utils/util");
class CouponService {
    constructor() {
        this.coupons = coupons_model_1.default;
    }
    async findAllCoupons() {
        const coupons = await this.coupons.find();
        return coupons;
    }
    async findCouponById(couponId) {
        if ((0, util_1.isEmpty)(couponId))
            throw new HttpException_1.HttpException(400, 'CouponId is empty');
        const findCoupon = await this.coupons.findOne({ _id: couponId });
        if (!findCoupon)
            throw new HttpException_1.HttpException(409, "Coupon doesn't exist");
        return findCoupon;
    }
    async findCouponByCode(code) {
        if ((0, util_1.isEmpty)(code))
            throw new HttpException_1.HttpException(400, 'Coupon code is empty');
        const findCoupon = await this.coupons.findOne({ code: code.toUpperCase() });
        if (!findCoupon)
            throw new HttpException_1.HttpException(409, "Coupon doesn't exist");
        return findCoupon;
    }
    async createCoupon(couponData) {
        if ((0, util_1.isEmpty)(couponData))
            throw new HttpException_1.HttpException(400, 'couponData is empty');
        const existingCoupon = await this.coupons.findOne({ code: couponData.code.toUpperCase() });
        if (existingCoupon)
            throw new HttpException_1.HttpException(409, `Coupon code ${couponData.code} already exists`);
        if (couponData.startDate >= couponData.endDate) {
            throw new HttpException_1.HttpException(400, 'End date must be after start date');
        }
        const createCouponData = await this.coupons.create(Object.assign(Object.assign({}, couponData), { code: couponData.code.toUpperCase(), status: coupons_interface_1.CouponStatus.ACTIVE }));
        return createCouponData;
    }
    async updateCoupon(couponId, couponData) {
        var _a;
        if ((0, util_1.isEmpty)(couponData))
            throw new HttpException_1.HttpException(400, 'couponData is empty');
        if (couponData.code) {
            const existingCoupon = await this.coupons.findOne({
                code: couponData.code.toUpperCase(),
                _id: { $ne: couponId },
            });
            if (existingCoupon)
                throw new HttpException_1.HttpException(409, `Coupon code ${couponData.code} already exists`);
        }
        if (couponData.startDate && couponData.endDate && couponData.startDate >= couponData.endDate) {
            throw new HttpException_1.HttpException(400, 'End date must be after start date');
        }
        const updateCouponById = await this.coupons.findByIdAndUpdate(couponId, Object.assign(Object.assign({}, couponData), { code: (_a = couponData.code) === null || _a === void 0 ? void 0 : _a.toUpperCase() }), { new: true });
        if (!updateCouponById)
            throw new HttpException_1.HttpException(409, "Coupon doesn't exist");
        return updateCouponById;
    }
    async deleteCoupon(couponId) {
        const deleteCouponById = await this.coupons.findByIdAndDelete(couponId);
        if (!deleteCouponById)
            throw new HttpException_1.HttpException(409, "Coupon doesn't exist");
        return deleteCouponById;
    }
    async validateCoupon(validationData) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        try {
            const coupon = await this.findCouponByCode(validationData.code);
            if (coupon.status !== coupons_interface_1.CouponStatus.ACTIVE) {
                return { isValid: false, discount: 0, message: 'Coupon is not active' };
            }
            const now = new Date();
            if (now < coupon.startDate || now > coupon.endDate) {
                return { isValid: false, discount: 0, message: 'Coupon is not valid for this date' };
            }
            if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
                return { isValid: false, discount: 0, message: 'Coupon usage limit reached' };
            }
            if (coupon.minimumPurchase && validationData.cartTotal < coupon.minimumPurchase) {
                return {
                    isValid: false,
                    discount: 0,
                    message: `Minimum purchase amount of ${coupon.minimumPurchase} required`,
                };
            }
            if (((_a = coupon.conditions) === null || _a === void 0 ? void 0 : _a.firstPurchaseOnly) && !validationData.isFirstPurchase) {
                return { isValid: false, discount: 0, message: 'Coupon is valid for first purchase only' };
            }
            if (((_b = validationData.productIds) === null || _b === void 0 ? void 0 : _b.length) > 0 || ((_c = validationData.categoryIds) === null || _c === void 0 ? void 0 : _c.length) > 0) {
                const hasApplicableProducts = !((_e = (_d = coupon.conditions) === null || _d === void 0 ? void 0 : _d.applicableProducts) === null || _e === void 0 ? void 0 : _e.length) ||
                    ((_f = validationData.productIds) === null || _f === void 0 ? void 0 : _f.some(id => coupon.conditions.applicableProducts.includes(id)));
                const hasApplicableCategories = !((_h = (_g = coupon.conditions) === null || _g === void 0 ? void 0 : _g.applicableCategories) === null || _h === void 0 ? void 0 : _h.length) ||
                    ((_j = validationData.categoryIds) === null || _j === void 0 ? void 0 : _j.some(id => coupon.conditions.applicableCategories.includes(id)));
                const hasExcludedProducts = ((_l = (_k = coupon.conditions) === null || _k === void 0 ? void 0 : _k.excludedProducts) === null || _l === void 0 ? void 0 : _l.length) &&
                    ((_m = validationData.productIds) === null || _m === void 0 ? void 0 : _m.some(id => coupon.conditions.excludedProducts.includes(id)));
                const hasExcludedCategories = ((_p = (_o = coupon.conditions) === null || _o === void 0 ? void 0 : _o.excludedCategories) === null || _p === void 0 ? void 0 : _p.length) &&
                    ((_q = validationData.categoryIds) === null || _q === void 0 ? void 0 : _q.some(id => coupon.conditions.excludedCategories.includes(id)));
                if ((!hasApplicableProducts && !hasApplicableCategories) || hasExcludedProducts || hasExcludedCategories) {
                    return { isValid: false, discount: 0, message: 'Coupon is not applicable to these items' };
                }
            }
            let discount = 0;
            if (coupon.type === coupons_interface_1.CouponType.PERCENTAGE) {
                discount = validationData.cartTotal * (coupon.value / 100);
                if (coupon.maximumDiscount) {
                    discount = Math.min(discount, coupon.maximumDiscount);
                }
            }
            else {
                discount = coupon.value;
            }
            return { isValid: true, discount };
        }
        catch (error) {
            if (error instanceof HttpException_1.HttpException) {
                return { isValid: false, discount: 0, message: error.message };
            }
            throw error;
        }
    }
    async incrementUsageCount(couponCode) {
        await this.coupons.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usageCount: 1 } });
    }
}
exports.default = CouponService;
//# sourceMappingURL=coupons.service.js.map