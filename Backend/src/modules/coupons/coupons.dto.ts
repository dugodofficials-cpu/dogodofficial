import { IsString, IsEnum, IsNumber, IsOptional, IsDate, IsBoolean, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType, CouponStatus } from './coupons.interface';
export class CouponConditionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableProducts?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategories?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedProducts?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedCategories?: string[];
  @IsOptional()
  @IsBoolean()
  firstPurchaseOnly?: boolean;
}
export class CreateCouponDto {
  @IsString()
  code: string;
  @IsEnum(CouponType)
  type: CouponType;
  @IsNumber()
  @Min(0)
  value: number;
  @IsString()
  description: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPurchase?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscount?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;
  @IsDate()
  @Type(() => Date)
  startDate: Date;
  @IsDate()
  @Type(() => Date)
  endDate: Date;
  @IsOptional()
  @ValidateNested()
  @Type(() => CouponConditionsDto)
  conditions?: CouponConditionsDto;
}
export class UpdateCouponDto extends CreateCouponDto {
  @IsOptional()
  @IsString()
  code: string;
  @IsOptional()
  @IsEnum(CouponType)
  type: CouponType;
  @IsOptional()
  @IsNumber()
  @Min(0)
  value: number;
  @IsOptional()
  @IsString()
  description: string;
  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;
}
export class ValidateCouponDto {
  @IsString()
  code: string;
  @IsNumber()
  @Min(0)
  cartTotal: number;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
  @IsOptional()
  @IsBoolean()
  isFirstPurchase?: boolean;
}