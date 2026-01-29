import { NextFunction, Response } from 'express';
import { RequestWithUser } from '../interfaces/auth.interface';
import { Permission } from '../modules/roles/roles.interface';
export declare const hasPermission: (permission: Permission) => (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
