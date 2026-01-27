import { NextFunction, Request, Response } from 'express';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, RevokeRoleDto } from '@/modules/roles/roles.dto';
import RoleService from '@/modules/roles/roles.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Permission, PERMISSION_VALUES } from '@/modules/roles/roles.interface';
class RoleController {
  public roleService = new RoleService();
  public getRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllRolesData = await this.roleService.findAllRoles();
      res.status(200).json({ data: findAllRolesData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getRoleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = String(req.params.id);
      const findOneRoleData = await this.roleService.findRoleById(roleId);
      res.status(200).json({ data: findOneRoleData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public createRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleData: CreateRoleDto = req.body;
      const createRoleData = await this.roleService.createRole(roleData);
      res.status(201).json({ data: createRoleData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = String(req.params.id);
      const roleData: UpdateRoleDto = req.body;
      const updateRoleData = await this.roleService.updateRole(roleId, roleData);
      res.status(200).json({ data: updateRoleData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = String(req.params.id);
      const deleteRoleData = await this.roleService.deleteRole(roleId);
      res.status(200).json({ data: deleteRoleData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public assignRole = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignRoleData = req.body;
      const assignedBy = req.user._id.toString();
      const assignRoleToUser = await this.roleService.assignRole(assignRoleData, assignedBy);
      res.status(200).json({ data: assignRoleToUser, message: 'Role assigned successfully' });
    } catch (error) {
      next(error);
    }
  };
  public revokeRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const revokeRoleData: RevokeRoleDto = req.body;
      await this.roleService.revokeRole(revokeRoleData.userId, revokeRoleData.roleId);
      res.status(200).json({ message: 'role revoked' });
    } catch (error) {
      next(error);
    }
  };
  public getUserRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = String(req.params.userId);
      const userRoles = await this.roleService.getUserRoles(userId);
      res.status(200).json({ data: userRoles, message: 'user roles retrieved' });
    } catch (error) {
      next(error);
    }
  };
  public getUserCurrentRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = String(req.params.userId);
      const currentRole = await this.roleService.getUserCurrentRole(userId);
      res.status(200).json({
        data: currentRole,
        message: currentRole ? 'User current role retrieved' : 'User has no role assigned'
      });
    } catch (error) {
      next(error);
    }
  };
  public checkPermission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = String(req.params.userId);
      const permission = req.params.permission as Permission;
      const hasPermission = await this.roleService.hasPermission({ userId, permission, email: null });
      res.status(200).json({ data: hasPermission, message: 'permission checked' });
    } catch (error) {
      next(error);
    }
  };
  public checkRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = String(req.params.userId);
      const roleName = String(req.params.roleName);
      const hasRole = await this.roleService.hasRole(userId, roleName);
      res.status(200).json({ data: hasRole, message: 'role checked' });
    } catch (error) {
      next(error);
    }
  };
  public getPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await this.roleService.getPermissions();
      res.status(200).json({ data: permissions, message: 'permissions retrieved' });
    } catch (error) {
      next(error);
    }
  };
}
export default RoleController;