import { IsString, IsNotEmpty, IsBoolean, Length, IsArray, IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
  @IsString()
  @IsNotEmpty()
  @Length(2, 3)
  public code: string;
  @IsString()
  @IsNotEmpty()
  public phoneCode: string;
  @IsString()
  @IsNotEmpty()
  @Length(3)
  public currency: string;
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  public region: string[];
  @IsBoolean()
  public isActive = true;
}
export class UpdateCountryDto extends CreateCountryDto {}
export class GetCountriesQueryDto {
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
  @IsString()
  public sortBy?: 'name' | 'code' | 'currency' | 'createdAt' = 'name';
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public sortOrder?: 'asc' | 'desc' = 'asc';
}