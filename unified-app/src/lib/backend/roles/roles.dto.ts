import { IsString, IsArray, IsEnum, IsOptional, IsBoolean, ArrayUnique, IsNotEmpty } from 'class-validator';
import { Permission } from '@backend/roles/roles.interface';
export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
  @IsString()
  @IsNotEmpty()
  public description: string;
  @IsArray()
  @ArrayUnique()
  @IsEnum(Permission, { each: true })
  public permissions: Permission[];
  @IsOptional()
  @IsBoolean()
  public isDefault?: boolean;
}
export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public name?: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public description?: string;
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(Permission, { each: true })
  public permissions?: Permission[];
  @IsOptional()
  @IsBoolean()
  public isDefault?: boolean;
}
export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;
  @IsString()
  @IsNotEmpty()
  public roleId: string;
}
export class RevokeRoleDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;
  @IsString()
  @IsNotEmpty()
  public roleId: string;
}