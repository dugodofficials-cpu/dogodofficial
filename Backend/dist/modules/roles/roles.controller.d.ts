import { NextFunction, Request, Response } from 'express';
import RoleService from '../../modules/roles/roles.service';
import { RequestWithUser } from '../../interfaces/auth.interface';
declare class RoleController {
    roleService: RoleService;
    getRoles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRoleById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    assignRole: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    revokeRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserRoles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserCurrentRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    checkPermission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    checkRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPermissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default RoleController;
