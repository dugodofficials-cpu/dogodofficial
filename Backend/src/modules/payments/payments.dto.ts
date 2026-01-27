import { IsString, IsNumber, IsEnum, IsOptional, ValidateNested, Min, IsDate, IsObject, IsMongoId, IsEmail, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus, PaymentMethod, PaymentProvider, PaymentChannel } from './payments.interface';
export class PaymentDetailsDto {
  @IsEnum(PaymentChannel)
  public method: PaymentChannel;
  @IsEnum(PaymentProvider)
  public provider: PaymentProvider;
  @IsOptional()
  @IsString()
  public transactionId?: string;
  @IsOptional()
  @IsString()
  public cardLast4?: string;
  @IsOptional()
  @IsString()
  public cardBrand?: string;
  @IsOptional()
  @IsString()
  public cardExpiryMonth?: string;
  @IsOptional()
  @IsString()
  public cardExpiryYear?: string;
  @IsOptional()
  @IsString()
  public bankName?: string;
  @IsOptional()
  @IsString()
  public bankAccountLast4?: string;
  @IsOptional()
  @IsString()
  public walletType?: string;
  @IsOptional()
  @IsString()
  public cryptoCurrency?: string;
  @IsOptional()
  @IsString()
  public cryptoAddress?: string;
}
export class RefundDetailsDto {
  @IsNumber()
  @Min(0)
  public amount: number;
  @IsString()
  public reason: string;
  @IsEnum(PaymentStatus)
  public status: PaymentStatus;
  @IsString()
  public transactionId: string;
  @IsDate()
  @Type(() => Date)
  public refundedAt: Date;
  @IsOptional()
  @IsString()
  public processedBy?: string;
  @IsOptional()
  @IsString()
  public notes?: string;
}
export class CreatePaymentDto {
  @IsMongoId()
  public order: string;
  @IsMongoId()
  public user: string;
  @IsNumber()
  @Min(0)
  public amount: number;
  @IsString()
  public currency: string;
  @IsOptional()
  @IsEnum(PaymentStatus)
  public status?: PaymentStatus;
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  public paymentDetails: PaymentDetailsDto;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
  @IsOptional()
  @IsString()
  public notes?: string;
}
export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  public status?: PaymentStatus;
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  public paymentDetails?: PaymentDetailsDto;
  @IsOptional()
  @IsString()
  public errorCode?: string;
  @IsOptional()
  @IsString()
  public errorMessage?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public attempts?: number;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
  @IsOptional()
  @IsString()
  public notes?: string;
}
export class CreateRefundDto {
  @IsNumber()
  @Min(0)
  public amount: number;
  @IsString()
  public reason: string;
  @IsOptional()
  @IsString()
  public processedBy?: string;
  @IsOptional()
  @IsString()
  public notes?: string;
}
export class UpdateRefundStatusDto {
  @IsEnum(PaymentStatus)
  public status: PaymentStatus;
  @IsString()
  public transactionId: string;
  @IsOptional()
  @IsString()
  public notes?: string;
}
export class PaymentCustomerDto {
  @IsEmail()
  public email: string;
  @IsOptional()
  @IsString()
  public firstName?: string;
  @IsOptional()
  @IsString()
  public lastName?: string;
  @IsOptional()
  @IsString()
  public phone?: string;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class PaymentAmountDto {
  @IsNumber()
  @Min(0)
  public value: number;
  @IsString()
  public currency: string;
}
export class PaymentMethodDto {
  @IsEnum(PaymentChannel)
  public type: PaymentChannel;
  @IsOptional()
  @IsString()
  public cardNumber?: string;
  @IsOptional()
  @IsString()
  public expiryMonth?: string;
  @IsOptional()
  @IsString()
  public expiryYear?: string;
  @IsOptional()
  @IsString()
  public cvv?: string;
  @IsOptional()
  @IsString()
  public bank?: string;
  @IsOptional()
  @IsString()
  public accountNumber?: string;
}
export class InitiatePaymentDto {
  @IsNumber()
  @Min(0)
  public amount: number;
  @IsString()
  public currency: string;
  @IsEmail()
  public email: string;
  @IsOptional()
  @IsString()
  public firstName?: string;
  @IsOptional()
  @IsString()
  public lastName?: string;
  @IsEnum(PaymentProvider)
  public provider: PaymentProvider;
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  public paymentMethod: PaymentMethodDto;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  public status: PaymentStatus;
  @IsOptional()
  @IsString()
  public errorCode?: string;
  @IsOptional()
  @IsString()
  public errorMessage?: string;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public processedAt?: Date;
}
export class RefundPaymentDto {
  @IsNumber()
  @Min(0)
  public amount: number;
  @IsString()
  public reason: string;
  @IsOptional()
  @IsEnum(PaymentStatus)
  public status?: PaymentStatus;
  @IsOptional()
  @IsString()
  public notes?: string;
}
export class PaymentFilterDto {
  @IsOptional()
  @IsString()
  public userId?: string;
  @IsOptional()
  @IsString()
  public orderId?: string;
  @IsOptional()
  @IsEnum(PaymentStatus)
  public status?: PaymentStatus;
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
  public minAmount?: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  public maxAmount?: number;
  @IsOptional()
  @IsString()
  public currency?: string;
}
export class PaymentWebhookDto {
  @IsString()
  public event: string;
  @IsString()
  public reference: string;
  @IsEnum(PaymentStatus)
  public status: PaymentStatus;
  @IsNumber()
  public amount: number;
  @IsString()
  public currency: string;
  @IsOptional()
  @IsString()
  public gatewayResponse?: string;
  @IsOptional()
  @IsString()
  public ipAddress?: string;
  @IsOptional()
  @IsObject()
  public customer?: Record<string, any>;
  @IsOptional()
  @IsObject()
  public authorization?: Record<string, any>;
  @IsOptional()
  @IsObject()
  public metadata?: Record<string, any>;
}
export class PaymentMethodConfigDto {
  @IsEnum(PaymentChannel)
  public type: PaymentChannel;
  @IsBoolean()
  public enabled: boolean;
  @IsOptional()
  @IsObject()
  public config?: Record<string, any>;
}
export class PaymentProviderConfigDto {
  @IsEnum(PaymentProvider)
  public provider: PaymentProvider;
  @IsBoolean()
  public enabled: boolean;
  @IsString()
  public secretKey: string;
  @IsString()
  public publicKey: string;
  @IsOptional()
  @IsString()
  public webhookSecret?: string;
  @ValidateNested({ each: true })
  @Type(() => PaymentMethodConfigDto)
  public supportedMethods: PaymentMethodConfigDto[];
}