import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@/modules/auth/auth.interface';
import userModel from '@/modules/users/users.model';
import SessionService from '@/modules/auth/session.service';
const sessionService = new SessionService();
const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization =
      req.cookies['dugo-auth-token'] ||
      req.cookies['Authorization'] ||
      (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
    if (Authorization) {
      const session = await sessionService.findSessionByToken(Authorization);
      if (!session) {
        next(new HttpException(401, 'Session expired or invalid. Please login again.'));
        return;
      }
      const secretKey: string = SECRET_KEY;
      const verificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId);
      if (!findUser?.isEmailVerified) {
        throw new HttpException(401, 'Email verification required. Please check your inbox and verify your email address.');
      }
      if (findUser) {
        await sessionService.updateLastActivity(Authorization);
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, 'Invalid authentication token'));
      }
    } else {
      next(new HttpException(401, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Invalid authentication token'));
  }
};
export default authMiddleware;