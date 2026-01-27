import { NextFunction, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import RoleService from '@/modules/roles/roles.service';
import { Permission } from '@/modules/roles/roles.interface';
const roleService = new RoleService();
export const hasPermission = (permission: Permission) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id || null;
      const email = req.body?.email || null;
      const hasRequiredPermission = await roleService.hasPermission({ userId: userId ? userId.toString() : undefined, permission, email: email || undefined });
      if (!hasRequiredPermission) {
        throw new HttpException(403, 'Access denied. Insufficient permissions.');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};