import { IsEmail, IsString, IsNotEmpty, IsObject, ValidateNested, IsMongoId, IsOptional, IsIn, IsInt, Min, Max, MinLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  public street: string;
  @IsString()
  @IsNotEmpty()
  public city: string;
  @IsString()
  @IsNotEmpty()
  public state: string;
  @IsString()
  @IsNotEmpty()
  public postalCode: string;
  @IsString()
  @IsNotEmpty()
  public country: string;
}
export class CreateUserDto {
  @IsEmail()
  public email: string;
  @IsString()
  public password: string;
  @IsString()
  @IsNotEmpty()
  public firstName: string;
  @IsString()
  @IsNotEmpty()
  public lastName: string;
  @IsString()
  @IsNotEmpty()
  public phone: string;
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  public address: AddressDto;
  @IsMongoId()
  @IsNotEmpty()
  public country: string;
  @IsOptional()
  @IsString()
  public status?: string;
  @IsOptional()
  @IsMongoId()
  public role?: string;
}
export class UpdateUserDto extends CreateUserDto { }
export class GetUsersQueryDto {
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
  @IsIn(['email', 'firstName', 'lastName', 'phone', 'createdAt', 'updatedAt', 'totalOrdersCount'])
  public sortBy?: string;
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public sortOrder?: 'asc' | 'desc';
  @IsOptional()
  @IsString()
  public email?: string;
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
  @IsString()
  public 'address.city'?: string;
  @IsOptional()
  @IsString()
  public 'address.state'?: string;
  @IsOptional()
  @IsString()
  public 'address.country'?: string;
  @IsOptional()
  @IsMongoId()
  public country?: string;
  @IsOptional()
  @IsString()
  @MinLength(1)
  public search?: string;
  @IsOptional()
  @IsMongoId()
  public role?: string;
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'suspended'])
  public status?: string;
}