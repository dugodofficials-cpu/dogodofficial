import { NextFunction, Response } from 'express';
import { HttpException } from '@backend/exceptions/HttpException';
import { RequestWithUser } from '@backend/interfaces/auth.interface';
import RoleService from '@backend/roles/roles.service';
import { Permission } from '@backend/roles/roles.interface';
const roleService = new RoleService();

/**
 * Allows the request through if the authenticated user is acting on their own
 * resource (req.params[paramName] === req.user._id), or if they hold the given
 * permission (e.g. an admin managing another user's account).
 * Sets req.hasElevatedAccess so controllers can tell "self" apart from "admin"
 * and strip privileged fields (role, status, etc.) on plain self-edits.
 */
export const selfOrPermission = (permission: Permission, paramName = 'id') => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const targetId = req.params[paramName];
      const requesterId = req.user?._id ? String(req.user._id) : null;
      if (requesterId && targetId && requesterId === targetId) {
        (req as any).hasElevatedAccess = false;
        return next();
      }
      const hasRequiredPermission = await roleService.hasPermission({
        userId: requesterId || undefined,
        permission,
      });
      if (!hasRequiredPermission) {
        throw new HttpException(403, 'Access denied. Insufficient permissions.');
      }
      (req as any).hasElevatedAccess = true;
      next();
    } catch (error) {
      next(error);
    }
  };
};
