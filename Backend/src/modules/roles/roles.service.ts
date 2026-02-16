import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { Role, UserRole, Permission, PERMISSION_VALUES } from '@/modules/roles/roles.interface';
import { RoleModel, UserRoleModel } from '@/modules/roles/roles.model';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from '@/modules/roles/roles.dto';
import UserModel from '@/modules/users/users.model';
class RoleService {
  public async findAllRoles(): Promise<Role[]> {
    const roles = await RoleModel.find();
    return roles;
  }
  public async findRoleById(roleId: string): Promise<Role> {
    if (isEmpty(roleId)) throw new HttpException(400, 'RoleId is empty');
    const findRole = await RoleModel.findById(roleId);
    if (!findRole) throw new HttpException(409, "Role doesn't exist");
    return findRole;
  }
  public async createRole(roleData: CreateRoleDto): Promise<Role> {
    if (isEmpty(roleData)) throw new HttpException(400, 'roleData is empty');
    const findRole = await RoleModel.findOne({ name: roleData.name });
    if (findRole) throw new HttpException(409, `Role ${roleData.name} already exists`);
    const createRoleData = await RoleModel.create(roleData);
    return createRoleData;
  }
  public async updateRole(roleId: string, roleData: UpdateRoleDto): Promise<Role> {
    if (isEmpty(roleData)) throw new HttpException(400, 'roleData is empty');
    if (roleData.name) {
      const findRole = await RoleModel.findOne({ name: roleData.name, _id: { $ne: roleId } });
      if (findRole) throw new HttpException(409, `Role ${roleData.name} already exists`);
    }
    const updateRoleById = await RoleModel.findByIdAndUpdate(roleId, roleData, { new: true });
    if (!updateRoleById) throw new HttpException(409, "Role doesn't exist");
    return updateRoleById;
  }
  public async deleteRole(roleId: string): Promise<Role> {
    const deleteRoleById = await RoleModel.findByIdAndDelete(roleId);
    if (!deleteRoleById) throw new HttpException(409, "Role doesn't exist");
    await UserRoleModel.deleteMany({ roleId });
    return deleteRoleById;
  }
  public async assignRole(assignRoleData: AssignRoleDto, assignedBy: string): Promise<UserRole> {
    if (isEmpty(assignRoleData)) throw new HttpException(400, 'assignRoleData is empty');
    const user = await UserModel.findById(assignRoleData.userId);
    if (!user) throw new HttpException(409, "User doesn't exist");
    const role = await RoleModel.findById(assignRoleData.roleId);
    if (!role) throw new HttpException(409, "Role doesn't exist");
    const existingAssignment = await UserRoleModel.findOne({ userId: assignRoleData.userId });
    if (existingAssignment) {
      const updatedAssignment = await UserRoleModel.findByIdAndUpdate(
        existingAssignment._id,
        {
          roleId: assignRoleData.roleId,
          assignedBy,
          assignedAt: new Date(),
        },
        { new: true }
      );
      return updatedAssignment;
    } else {
      const createUserRoleData = await UserRoleModel.create({
        ...assignRoleData,
        assignedBy,
        assignedAt: new Date(),
      });
      return createUserRoleData;
    }
  }
  public async revokeRole(userId: string, roleId: string): Promise<void> {
    const deleteUserRole = await UserRoleModel.findOneAndDelete({
      userId,
      roleId,
    });
    if (!deleteUserRole) throw new HttpException(409, "User role assignment doesn't exist");
  }
  public async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await UserRoleModel.find({ userId }).populate('roleId');
    return userRoles.map(ur => ur.roleId as unknown as Role);
  }
  public async getUserCurrentRole(userId: string): Promise<Role | null> {
    const userRole = await UserRoleModel.findOne({ userId }).populate('roleId');
    return userRole ? (userRole.roleId as unknown as Role) : null;
  }
  public async hasPermission({ userId, permission, email }: { userId: string, permission: Permission, email: string }): Promise<boolean> {
    let userRole = null;
    if (email) {
      const user = await UserModel.findOne({ email });
      userRole = await UserRoleModel.findOne({ userId: user?._id?.toString() }).populate('roleId');
    } else {
      userRole = await UserRoleModel.findOne({ userId }).populate('roleId');
    }
    if (!userRole) return false;

    const role = userRole.roleId as unknown as Role | undefined | null;
    if (!role) return false;
    if (!Array.isArray((role as any).permissions)) return false;

    return (role as any).permissions.includes(permission);
  }
  public async hasRole(userId: string, roleName: string): Promise<boolean> {
    const role = await RoleModel.findOne({ name: roleName });
    if (!role) return false;
    const userRole = await UserRoleModel.findOne({
      userId,
      roleId: role._id,
    });
    return !!userRole;
  }
  public async getPermissions(): Promise<Permission[]> {
    const permissions = Object.values(Permission);
    return permissions;
  }
}
export default RoleService;