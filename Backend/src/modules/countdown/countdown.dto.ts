import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean, IsIn, IsInt, Min, Max, MinLength, IsHexColor } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CountdownStatus } from '@/modules/countdown/countdown.interface';
export class CreateCountdownDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  public title: string;
  @IsOptional()
  @IsString()
  public description?: string;
  @IsDateString()
  @IsNotEmpty()
  public launchDate: string;
  @IsOptional()
  @IsIn(Object.values(CountdownStatus))
  public status?: CountdownStatus;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  public isActive?: boolean;
  @IsOptional()
  @IsString()
  public backgroundImage?: string;
  @IsOptional()
  @IsHexColor()
  public backgroundColor?: string;
  @IsOptional()
  @IsHexColor()
  public textColor?: string;
  @IsOptional()
  @IsString()
  public buttonText?: string;
  @IsOptional()
  @IsHexColor()
  public buttonColor?: string;
  @IsOptional()
  @IsHexColor()
  public buttonTextColor?: string;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  public showDays?: boolean;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  public showHours?: boolean;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  public showMinutes?: boolean;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  public showSeconds?: boolean;
  @IsOptional()
  @IsString()
  public timezone?: string;
  @IsOptional()
  @IsString()
  public customMessage?: string;
}
export class UpdateCountdownDto extends CreateCountdownDto { }
export class GetCountdownsQueryDto {
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
  @IsIn(['title', 'launchDate', 'status', 'createdAt', 'updatedAt'])
  public sortBy?: string;
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  public sortOrder?: 'asc' | 'desc';
  @IsOptional()
  @IsString()
  @IsIn(Object.values(CountdownStatus))
  public status?: string;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  public isActive?: boolean;
  @IsOptional()
  @IsString()
  @MinLength(1)
  public search?: string;
}