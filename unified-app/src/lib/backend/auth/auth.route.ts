import AuthController from '@backend/auth/auth.controller';
import { Routes } from '@backend/interfaces/routes.interface';
import authMiddleware from '@backend/middlewares/auth.middleware';
import { authLimiter } from '@backend/middlewares/rateLimit.middleware';
import validationMiddleware from '@backend/middlewares/validation.middleware';
import { Router } from 'express';
import { SignUpDto, CreateAccountDto, SignUpGoogleDto, ResendVerificationDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';
class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(`${this.path}/google`, authLimiter, validationMiddleware(SignUpGoogleDto, 'body'), this.authController.signUpGoogle);
    this.router.post(`${this.path}/signup`, authLimiter, validationMiddleware(CreateAccountDto, 'body'), this.authController.signUp);
    this.router.post(`${this.path}/signin`, authLimiter, validationMiddleware(SignUpDto, 'body'), this.authController.logIn);
    // Staff-only enforcement happens inside logInAdmin, *after* the password is
    // verified (it checks findUser.userRoles.length). A hasPermission() gate
    // here would look the role up by req.body.email before any password check,
    // which lets a caller fingerprint staff/admin emails by whether a wrong
    // password yields 403 (no admin role) vs 401 (has one) — removed.
    this.router.post(`${this.path}/signin/admin`, [authLimiter, validationMiddleware(SignUpDto, 'body')], this.authController.logInAdmin);
    this.router.post(`${this.path}/logout`, authMiddleware, this.authController.logOut);
    this.router.get(`${this.path}/me`, authMiddleware, this.authController.getMe);
    this.router.get(`${this.path}/verify-email/:token`, this.authController.verifyEmail);
    this.router.post(`${this.path}/resend-verification`, authLimiter, validationMiddleware(ResendVerificationDto, 'body'), this.authController.resendVerificationEmail);
    this.router.get(`${this.path}/check-verification`, authLimiter, this.authController.checkEmailVerificationStatus);
    this.router.post(`${this.path}/forgot-password`, authLimiter, validationMiddleware(ForgotPasswordDto, 'body'), this.authController.forgotPassword);
    this.router.post(`${this.path}/reset-password`, authLimiter, validationMiddleware(ResetPasswordDto, 'body'), this.authController.resetPassword);
    this.router.get(`${this.path}/verify-reset-token/:token`, this.authController.verifyResetToken);
  }
}
export default AuthRoute;