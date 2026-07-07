import { IsEmail, IsString, IsNotEmpty, IsOptional, IsArray, IsObject, IsBoolean, IsDateString, IsIn, IsInt, Min, Max, MinLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';
export class SendEmailDto {
  @IsArray()
  @IsEmail({}, { each: true })
  public to: string[];
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  public cc?: string[];
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  public bcc?: string[];
  @IsString()
  @IsNotEmpty()
  public subject: string;
  @IsOptional()
  @IsString()
  public htmlContent?: string;
  @IsOptional()
  @IsString()
  public textContent?: string;
  @IsOptional()
  @IsString()
  public templateName?: string;
  @IsOptional()
  @IsObject()
  public variables?: Record<string, any>;
}
export class SendTemplateEmailDto {
  @IsString()
  @IsNotEmpty()
  public templateName: string;
  @IsArray()
  @IsEmail({}, { each: true })
  public to: string[];
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  public cc?: string[];
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  public bcc?: string[];
  @IsObject()
  @IsNotEmpty()
  public variables: Record<string, any>;
}
export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  public name: string;
  @IsString()
  @IsNotEmpty()
  public subject: string;
  @IsString()
  @IsNotEmpty()
  public htmlContent: string;
  @IsOptional()
  @IsString()
  public textContent?: string;
  @IsArray()
  @IsString({ each: true })
  public variables: string[];
}
export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  public name?: string;
  @IsOptional()
  @IsString()
  public subject?: string;
  @IsOptional()
  @IsString()
  public htmlContent?: string;
  @IsOptional()
  @IsString()
  public textContent?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public variables?: string[];
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
export class GetEmailLogsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  public page?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  public limit?: number;
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'sentAt', 'subject', 'status'])
  public sortBy?: string;
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public sortOrder?: 'asc' | 'desc';
  @IsOptional()
  @IsString()
  @IsIn(['sent', 'failed', 'pending'])
  public status?: string;
  @IsOptional()
  @IsString()
  public templateName?: string;
  @IsOptional()
  @IsEmail()
  public to?: string;
  @IsOptional()
  @IsDateString()
  public dateFrom?: string;
  @IsOptional()
  @IsDateString()
  public dateTo?: string;
  @IsOptional()
  @IsString()
  @MinLength(1)
  public search?: string;
}
export class GetTemplatesQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  public page?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  public limit?: number;
  @IsOptional()
  @IsString()
  @IsIn(['name', 'createdAt', 'updatedAt'])
  public sortBy?: string;
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public sortOrder?: 'asc' | 'desc';
  @IsOptional()
  @IsString()
  public name?: string;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  public isActive?: boolean;
  @IsOptional()
  @IsString()
  @MinLength(1)
  public search?: string;
}