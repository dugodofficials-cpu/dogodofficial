import AuthController from '@backend/auth/auth.controller';
import { Routes } from '@backend/interfaces/routes.interface';
import authMiddleware from '@backend/middlewares/auth.middleware';
import { authLimiter } from '@backend/middlewares/rateLimit.middleware';
import validationMiddleware from '@backend/middlewares/validation.middleware';
import { Router } from 'express';
import { SignUpDto, SignUpGoogleDto, ResendVerificationDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';
import { hasPermission } from '@backend/middlewares/permission.middleware';
import { Permission } from '@backend/roles/roles.interface';
class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(`${this.path}/google`, authLimiter, validationMiddleware(SignUpGoogleDto, 'body'), this.authController.signUpGoogle);
    this.router.post(`${this.path}/signup`, authLimiter, validationMiddleware(SignUpDto, 'body'), this.authController.signUp);
    this.router.post(`${this.path}/signin`, authLimiter, validationMiddleware(SignUpDto, 'body'), this.authController.logIn);
    this.router.post(`${this.path}/signin/admin`,[ authLimiter, validationMiddleware(SignUpDto, 'body'), hasPermission(Permission.LOGIN)], this.authController.logInAdmin);
    this.router.post(`${this.path}/logout`, authMiddleware, this.authController.logOut);
    this.router.get(`${this.path}/me`, authMiddleware, this.authController.getMe);
    this.router.get(`${this.path}/verify-email/:token`, this.authController.verifyEmail);
    this.router.post(`${this.path}/resend-verification`, validationMiddleware(ResendVerificationDto, 'body'), this.authController.resendVerificationEmail);
    this.router.get(`${this.path}/check-verification`, this.authController.checkEmailVerificationStatus);
    this.router.post(`${this.path}/forgot-password`, authLimiter, validationMiddleware(ForgotPasswordDto, 'body'), this.authController.forgotPassword);
    this.router.post(`${this.path}/reset-password`, authLimiter, validationMiddleware(ResetPasswordDto, 'body'), this.authController.resetPassword);
    this.router.get(`${this.path}/verify-reset-token/:token`, this.authController.verifyResetToken);
  }
}
export default AuthRoute;