import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '../../modules/auth/auth.interface';
import AuthService from '../../modules/auth/auth.service';
import RoleService from '../roles/roles.service';
import SessionService from './session.service';
declare class AuthController {
    authService: AuthService;
    roleService: RoleService;
    sessionService: SessionService;
    signUp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    signUpGoogle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logIn: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logInAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logOut: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    getMe: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resendVerificationEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    checkEmailVerificationStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verifyResetToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMySessions: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    revokeSession: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    revokeAllOtherSessions: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
}
export default AuthController;
