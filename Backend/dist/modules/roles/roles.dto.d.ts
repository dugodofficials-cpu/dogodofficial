import { Permission } from '../../modules/roles/roles.interface';
export declare class CreateRoleDto {
    name: string;
    description: string;
    permissions: Permission[];
    isDefault?: boolean;
}
export declare class UpdateRoleDto {
    name?: string;
    description?: string;
    permissions?: Permission[];
    isDefault?: boolean;
}
export declare class AssignRoleDto {
    userId: string;
    roleId: string;
}
export declare class RevokeRoleDto {
    userId: string;
    roleId: string;
}
