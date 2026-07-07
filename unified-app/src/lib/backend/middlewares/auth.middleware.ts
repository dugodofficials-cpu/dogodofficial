import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@backend/config';
import { HttpException } from '@backend/exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@backend/auth/auth.interface';
import userModel from '@backend/users/users.model';
import SessionService from '@backend/auth/session.service';
const sessionService = new SessionService();
const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    const Authorization =
      req.cookies['dugo-auth-token'] ||
      req.cookies['Authorization'] ||
      (authHeader ? authHeader.split('Bearer ')[1] : null);
    if (Authorization) {
      const session = await sessionService.findSessionByToken(Authorization);
      if (!session) {
        next(new HttpException(401, 'Session expired or invalid. Please login again.'));
        return;
      }
      const secretKey = (SECRET_KEY)!;
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