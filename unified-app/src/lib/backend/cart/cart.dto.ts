import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  ValidateNested,
  Min,
  IsDate,
  IsObject,
  IsMongoId,
  IsArray,
  IsBoolean,
  ArrayMinSize,
  IsIP,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CartStatus, DiscountType } from './cart.interface';
export class CartItemDto {
  @IsMongoId()
  public product: string;
  @IsNumber()
  @Min(1)
  public quantity: number;
  @IsOptional()
  @IsObject()
  public selectedOptions?: Record<string, any>;
  @IsOptional()
  @IsString()
  public notes?: string;
}
export class AppliedDiscountDto {
  @IsString()
  public code: string;
  @IsEnum(DiscountType)
  public type: DiscountType;
  @IsNumber()
  @Min(0)
  public value: number;
  @IsString()
  public description: string;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public expiresAt?: Date;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public minimumPurchase?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public maximumDiscount?: number;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class ShippingEstimateDto {
  @IsString()
  public provider: string;
  @IsString()
  public method: string;
  @IsNumber()
  @Min(0)
  public cost: number;
  @IsNumber()
  @Min(0)
  public estimatedDays: number;
  @IsBoolean()
  public isAvailable: boolean;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public restrictions?: string[];
}
export class CreateCartDto {
  @IsOptional()
  @IsMongoId()
  public user?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  public items?: CartItemDto[];
  @IsOptional()
  @IsString()
  public sessionId?: string;
  @IsOptional()
  @IsIP()
  public ipAddress?: string;
  @IsOptional()
  @IsString()
  public userAgent?: string;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public expiresAt?: Date;
  @IsOptional()
  @IsString()
  public notes?: string;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class UpdateCartDto {
  @IsOptional()
  @IsEnum(CartStatus)
  public status?: CartStatus;
  @IsOptional()
  @IsString()
  public selectedShippingMethod?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingEstimateDto)
  public shippingEstimates?: ShippingEstimateDto[];
  @IsOptional()
  @IsString()
  public notes?: string;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class AddItemDto {
  @ValidateNested()
  @Type(() => CartItemDto)
  public item: CartItemDto;
}
export class UpdateItemDto {
  @IsNumber()
  @Min(1)
  public quantity: number;
  @IsOptional()
  @IsObject()
  public selectedOptions?: Record<string, any>;
  @IsOptional()
  @IsString()
  public notes?: string;
}
export class ApplyDiscountDto {
  @IsString()
  public code: string;
}
export class UpdateShippingMethodDto {
  @IsString()
  public method: string;
}