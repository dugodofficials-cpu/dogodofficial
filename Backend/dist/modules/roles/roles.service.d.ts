import { Role, UserRole, Permission } from '../../modules/roles/roles.interface';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from '../../modules/roles/roles.dto';
declare class RoleService {
    findAllRoles(): Promise<Role[]>;
    findRoleById(roleId: string): Promise<Role>;
    createRole(roleData: CreateRoleDto): Promise<Role>;
    updateRole(roleId: string, roleData: UpdateRoleDto): Promise<Role>;
    deleteRole(roleId: string): Promise<Role>;
    assignRole(assignRoleData: AssignRoleDto, assignedBy: string): Promise<UserRole>;
    revokeRole(userId: string, roleId: string): Promise<void>;
    getUserRoles(userId: string): Promise<Role[]>;
    getUserCurrentRole(userId: string): Promise<Role | null>;
    hasPermission({ userId, permission, email }: {
        userId: string;
        permission: Permission;
        email: string;
    }): Promise<boolean>;
    hasRole(userId: string, roleName: string): Promise<boolean>;
    getPermissions(): Promise<Permission[]>;
}
export default RoleService;
