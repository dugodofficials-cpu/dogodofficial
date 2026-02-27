import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  Max,
  IsIn,
} from 'class-validator';
import { PaymentStatus } from '../payments/payments.interface';
import { Carriers, DeliveryStatus, OrderStatus } from './orders.interface';
export class AddressDto {
  @IsString()
  public street: string;
  @IsString()
  public city: string;
  @IsString()
  public state: string;
  @IsString()
  public postalCode: string;
  @IsString()
  public country: string;
}
export class ShippingDetailsDto {
  @ValidateNested()
  @Type(() => AddressDto)
  public address: AddressDto;
  @IsOptional()
  @IsString()
  public trackingNumber?: string;
  @IsOptional()
  @IsEnum(Carriers)
  public carrier?: Carriers;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public estimatedDeliveryDate?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public actualDeliveryDate?: Date;
  @IsEnum(DeliveryStatus)
  public deliveryStatus: DeliveryStatus;
  @IsOptional()
  @IsString()
  public deliveryNotes?: string;
}
export class DigitalDeliveryDetailsDto {
  @IsEmail()
  public email: string;
  @IsArray()
  @IsString({ each: true })
  public downloadLinks: string[];
  @IsArray()
  @IsString({ each: true })
  public accessKeys: string[];
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public expiryDate?: Date;
  @IsNumber()
  @Min(0)
  public downloadCount: number;
}
export class OrderItemDto {
  @IsMongoId()
  public product: string;
  @IsNumber()
  @Min(1)
  public quantity: number;
  @IsNumber()
  @Min(0)
  public price: number;
  @IsNumber()
  @Min(0)
  public total: number;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public selectedOptions?: string[];
}
export class CreateOrderDto {
  @IsOptional()
  @IsMongoId()
  public user?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderItemDto)
  public items: OrderItemDto[];
  @IsNumber()
  @Min(0)
  public subtotal: number;
  @IsNumber()
  @Min(0)
  public tax: number;
  @IsNumber()
  @Min(0)
  public shippingCost: number;
  @IsNumber()
  @Min(0)
  public discount: number;
  @IsNumber()
  @Min(0)
  public total: number;
  @IsOptional()
  @IsEnum(OrderStatus)
  public status?: OrderStatus;
  @IsString()
  public paymentStatus: string;
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingDetailsDto)
  public shippingDetails: ShippingDetailsDto;
  @IsOptional()
  @ValidateNested()
  @Type(() => DigitalDeliveryDetailsDto)
  public digitalDeliveryDetails?: DigitalDeliveryDetailsDto;
  @IsOptional()
  @IsString()
  public notes?: string;
  @IsOptional()
  @IsBoolean()
  public isGift?: boolean;
  @IsOptional()
  @IsString()
  public giftMessage?: string;
  @IsOptional()
  @IsString()
  public couponId?: string;
}
export class UpdateOrderDto extends CreateOrderDto {
  @IsOptional()
  @IsMongoId()
  public user: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderItemDto)
  public items: OrderItemDto[];
  @IsOptional()
  @IsNumber()
  @Min(0)
  public subtotal: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public tax: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public shippingCost: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public total: number;
  @IsOptional()
  @IsEnum(PaymentStatus)
  public paymentStatus: PaymentStatus;
}
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  public status: OrderStatus;
  @IsOptional()
  @IsString()
  public notes?: string;
  @IsOptional()
  @IsEnum(PaymentStatus)
  public paymentStatus: PaymentStatus;
}
export class UpdateDeliveryStatusDto {
  @IsEnum(DeliveryStatus)
  public deliveryStatus: DeliveryStatus;
  @IsOptional()
  @IsString()
  public trackingNumber?: string;
  @IsOptional()
  @IsEnum(Carriers)
  public carrier?: Carriers;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public estimatedDeliveryDate?: Date;
  @IsOptional()
  @IsString()
  public deliveryNotes?: string;
}

export class BulkDeleteOrdersDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  public orderIds: string[];

  @IsOptional()
  @IsString()
  public notes?: string;
}
export class GetOrdersQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  public page?: number = 1;
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  public limit?: number = 10;
  @IsOptional()
  @IsString()
  public search?: string;
  @IsOptional()
  @IsEnum(OrderStatus)
  public status?: OrderStatus;
  @IsOptional()
  @IsString()
  public userId?: string;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public startDate?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public endDate?: Date;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public minTotal?: number;
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  public includeBundleItems?: boolean = false;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public maxTotal?: number;
  @IsOptional()
  @IsString()
  public sortBy?: 'orderNumber' | 'total' | 'orderedAt' | 'status' = 'orderedAt';
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public sortOrder?: 'asc' | 'desc' = 'desc';
}