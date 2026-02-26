import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@/modules/users/users.dto';
import { RequestWithUser } from '@/modules/auth/auth.interface';
import { User, UserDocument } from '@/modules/users/users.interface';
import AuthService from '@/modules/auth/auth.service';
import { SignUpDto, SignUpGoogleDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';
import { Types } from 'mongoose';
import RoleService from '../roles/roles.service';
import { HttpException } from '@/exceptions/HttpException';
import SessionService from './session.service';
class AuthController {
  public authService = new AuthService();
  public roleService = new RoleService();
  public sessionService = new SessionService();
  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: SignUpDto = req.body;
      const { message } = await this.authService.signup(userData);
      res.status(201).json({
        message: message || 'Signup successful',
      });
    } catch (error) {
      next(error);
    }
  };
  public signUpGoogle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: SignUpGoogleDto = req.body;
      const { user, token, cookie, message } = await this.authService.signupGoogle(userData);
      res.setHeader('Set-Cookie', [cookie]);
      res.status(201).json({
        data: {
          ...user,
          password: undefined,
          token,
        },
        message: message || 'Google authentication successful',
      });
    } catch (error) {
      next(error);
    }
  };
  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const { token, findUser, cookie } = await this.authService.login(userData, ipAddress, userAgent);
      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({
        data: {
          ...findUser.toObject(),
          password: undefined,
          token,
        },
        message: 'login successful',
      });
    } catch (error) {
      next(error);
    }
  };
  public logInAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const { token, findUser, cookie } = await this.authService.login(userData, ipAddress, userAgent);
      if (!findUser.userRoles || !findUser.userRoles.length) {
        throw new HttpException(403, 'Access denied. Insufficient permissions.');
      }
      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({
        data: {
          ...findUser.toObject(),
          password: undefined,
          token,
        },
        message: 'login successful',
      });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const token = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
      const logOutUserData: User = await this.authService.logout(userData, token);
      const isProd = process.env.NODE_ENV === 'production';
      const secureFlag = isProd ? ' Secure;' : '';
      res.setHeader('Set-Cookie', [
        `Authorization=; HttpOnly; Path=/; SameSite=Lax;${secureFlag} Max-Age=0;`,
        `dugo-auth-token=; HttpOnly; Path=/; SameSite=Lax;${secureFlag} Max-Age=0;`,
      ]);
      res.status(200).json({ data: logOutUserData, message: 'logout successful' });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const user = await this.authService.findUserById(userData._id);
      res.status(200).json({ data: user, message: 'get user profile' });
    } catch (error) {
      next(error);
    }
  };
  public verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const result = await this.authService.verifyEmail(token);
      if (result.success && result.token && result.cookie) {
        res.setHeader('Set-Cookie', [result.cookie]);
        res.status(200).json({
          data: {
            success: result.success,
            message: result.message,
            user: result.user,
            token: result.token
          },
          message: result.message,
        });
      } else {
        res.status(200).json({
          data: result,
          message: result.message,
        });
      }
    } catch (error) {
      next(error);
    }
  };
  public resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await this.authService.resendVerificationEmail(email);
      res.status(200).json({
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
  public checkEmailVerificationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.query;
      if (!email || typeof email !== 'string') {
        throw new Error('Email query parameter is required');
      }
      const result = await this.authService.checkEmailVerificationStatus(email);
      res.status(200).json({
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await this.authService.forgotPassword(email);
      res.status(200).json({
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      const result = await this.authService.resetPassword(token, password);
      res.status(200).json({
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
  public verifyResetToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const result = await this.authService.verifyResetToken(token);
      res.status(200).json({
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
  public getMySessions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const sessions = await this.sessionService.findUserSessions(userData._id);
      res.status(200).json({
        data: sessions,
        message: 'Sessions retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  public revokeSession = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const { sessionId } = req.params;
      await this.sessionService.revokeSessionById(sessionId, userData._id);
      res.status(200).json({
        message: 'Session revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  public revokeAllOtherSessions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const currentToken = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
      await this.sessionService.revokeAllUserSessions(userData._id, currentToken);
      res.status(200).json({
        message: 'All other sessions revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
export default AuthController;