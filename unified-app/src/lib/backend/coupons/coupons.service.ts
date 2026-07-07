import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './coupons.dto';
import { HttpException } from '@backend/exceptions/HttpException';
import { Coupon, CouponStatus, CouponType } from './coupons.interface';
import couponModel from './coupons.model';
import { isEmpty } from '@backend/utils/util';
class CouponService {
  public coupons = couponModel;
  public async findAllCoupons(): Promise<Coupon[]> {
    const coupons: Coupon[] = await this.coupons.find();
    return coupons;
  }
  public async findCouponById(couponId: string): Promise<Coupon> {
    if (isEmpty(couponId)) throw new HttpException(400, 'CouponId is empty');
    const findCoupon = await this.coupons.findOne({ _id: couponId });
    if (!findCoupon) throw new HttpException(409, "Coupon doesn't exist");
    return findCoupon;
  }
  public async findCouponByCode(code: string): Promise<Coupon> {
    if (isEmpty(code)) throw new HttpException(400, 'Coupon code is empty');
    const findCoupon = await this.coupons.findOne({ code: code.toUpperCase() });
    if (!findCoupon) throw new HttpException(409, "Coupon doesn't exist");
    return findCoupon;
  }
  public async createCoupon(couponData: CreateCouponDto): Promise<Coupon> {
    if (isEmpty(couponData)) throw new HttpException(400, 'couponData is empty');
    const existingCoupon = await this.coupons.findOne({ code: couponData.code.toUpperCase() });
    if (existingCoupon) throw new HttpException(409, `Coupon code ${couponData.code} already exists`);
    if (couponData.startDate >= couponData.endDate) {
      throw new HttpException(400, 'End date must be after start date');
    }
    const createCouponData: Coupon = await this.coupons.create({
      ...couponData,
      code: couponData.code.toUpperCase(),
      status: CouponStatus.ACTIVE,
    });
    return createCouponData;
  }
  public async updateCoupon(couponId: string, couponData: UpdateCouponDto): Promise<Coupon> {
    if (isEmpty(couponData)) throw new HttpException(400, 'couponData is empty');
    if (couponData.code) {
      const existingCoupon = await this.coupons.findOne({
        code: couponData.code.toUpperCase(),
        _id: { $ne: couponId },
      });
      if (existingCoupon) throw new HttpException(409, `Coupon code ${couponData.code} already exists`);
    }
    if (couponData.startDate && couponData.endDate && couponData.startDate >= couponData.endDate) {
      throw new HttpException(400, 'End date must be after start date');
    }
    const updateCouponById = await this.coupons.findByIdAndUpdate(
      couponId,
      { ...couponData, code: couponData.code?.toUpperCase() },
      { new: true },
    );
    if (!updateCouponById) throw new HttpException(409, "Coupon doesn't exist");
    return updateCouponById;
  }
  public async deleteCoupon(couponId: string): Promise<Coupon> {
    const deleteCouponById = await this.coupons.findByIdAndDelete(couponId);
    if (!deleteCouponById) throw new HttpException(409, "Coupon doesn't exist");
    return deleteCouponById;
  }
  public async validateCoupon(validationData: ValidateCouponDto): Promise<{
    isValid: boolean;
    discount: number;
    message?: string;
  }> {
    try {
      const coupon = await this.findCouponByCode(validationData.code);
      if (coupon.status !== CouponStatus.ACTIVE) {
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
      if (coupon.conditions?.firstPurchaseOnly && !validationData.isFirstPurchase) {
        return { isValid: false, discount: 0, message: 'Coupon is valid for first purchase only' };
      }
      if ((validationData.productIds?.length ?? 0) > 0 || (validationData.categoryIds?.length ?? 0) > 0) {
        const hasApplicableProducts = !coupon.conditions?.applicableProducts?.length ||
          validationData.productIds?.some(id => coupon.conditions?.applicableProducts?.includes(id));
        const hasApplicableCategories = !coupon.conditions?.applicableCategories?.length ||
          validationData.categoryIds?.some(id => coupon.conditions?.applicableCategories?.includes(id));
        const hasExcludedProducts = coupon.conditions?.excludedProducts?.length &&
          validationData.productIds?.some(id => coupon.conditions?.excludedProducts?.includes(id));
        const hasExcludedCategories = coupon.conditions?.excludedCategories?.length &&
          validationData.categoryIds?.some(id => coupon.conditions?.excludedCategories?.includes(id));
        if ((!hasApplicableProducts && !hasApplicableCategories) || hasExcludedProducts || hasExcludedCategories) {
          return { isValid: false, discount: 0, message: 'Coupon is not applicable to these items' };
        }
      }
      let discount = 0;
      if (coupon.type === CouponType.PERCENTAGE) {
        discount = validationData.cartTotal * (coupon.value / 100);
        if (coupon.maximumDiscount) {
          discount = Math.min(discount, coupon.maximumDiscount);
        }
      } else {
        discount = coupon.value;
      }
      return { isValid: true, discount };
    } catch (error) {
      if (error instanceof HttpException) {
        return { isValid: false, discount: 0, message: error.message };
      }
      throw error;
    }
  }
  public async incrementUsageCount(couponCode: string): Promise<void> {
    await this.coupons.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usageCount: 1 } });
  }
}
export default CouponService;