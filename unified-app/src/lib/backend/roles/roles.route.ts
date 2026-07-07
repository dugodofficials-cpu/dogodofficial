import { Router } from 'express';
import { Routes } from '@backend/interfaces/routes.interface';
import RoleController from '@backend/roles/roles.controller';
import validationMiddleware from '@backend/middlewares/validation.middleware';
import authMiddleware from '@backend/middlewares/auth.middleware';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, RevokeRoleDto } from '@backend/roles/roles.dto';
import { Permission } from '@backend/roles/roles.interface';
import { hasPermission } from '@backend/middlewares/permission.middleware';
class RoleRoute implements Routes {
  public path = '/roles';
  public router = Router();
  public roleController = new RoleController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, [authMiddleware, hasPermission(Permission.READ_ROLE)], this.roleController.getRoles);
    this.router.get(`${this.path}/permissions`, [authMiddleware, hasPermission(Permission.READ_ROLE)], this.roleController.getPermissions);
    this.router.get(`${this.path}/:id`, [authMiddleware, hasPermission(Permission.READ_ROLE)], this.roleController.getRoleById);
    this.router.post(
      `${this.path}`,
      [authMiddleware, hasPermission(Permission.CREATE_ROLE), validationMiddleware(CreateRoleDto)],
      this.roleController.createRole,
    );
    this.router.put(
      `${this.path}/:id`,
      [authMiddleware, hasPermission(Permission.UPDATE_ROLE), validationMiddleware(UpdateRoleDto)],
      this.roleController.updateRole,
    );
    this.router.delete(`${this.path}/:id`, [authMiddleware, hasPermission(Permission.DELETE_ROLE)], this.roleController.deleteRole);
    this.router.post(
      `${this.path}/assign`,
      [authMiddleware, hasPermission(Permission.ASSIGN_ROLE), validationMiddleware(AssignRoleDto)],
      this.roleController.assignRole,
    );
    this.router.post(
      `${this.path}/revoke`,
      [authMiddleware, hasPermission(Permission.ASSIGN_ROLE), validationMiddleware(RevokeRoleDto)],
      this.roleController.revokeRole,
    );
    this.router.get(`${this.path}/user/:userId`, [authMiddleware, hasPermission(Permission.READ_ROLE)], this.roleController.getUserRoles);
    this.router.get(`${this.path}/user/:userId/current`, [authMiddleware, hasPermission(Permission.READ_ROLE)], this.roleController.getUserCurrentRole);
    this.router.get(
      `${this.path}/check-permission/:userId/:permission`,
      [authMiddleware, hasPermission(Permission.READ_ROLE)],
      this.roleController.checkPermission,
    );
    this.router.get(
      `${this.path}/check-role/:userId/:roleName`,
      [authMiddleware, hasPermission(Permission.READ_ROLE)],
      this.roleController.checkRole,
    );
  }
}
export default RoleRoute;