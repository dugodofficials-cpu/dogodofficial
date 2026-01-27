import rateLimit from 'express-rate-limit';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { DataStoredInToken } from '@/modules/auth/auth.interface';

export const rateLimiter = (
  windowMs: number = 15 * 60 * 1000,
  max: number = 10000,
  customMessage?: { status: number; error: string },
) => {
  return rateLimit({
    windowMs,
    max,
    message: customMessage || {
      status: 429,
      error: 'Too many requests from this user, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request): string => {
      let userId: string | undefined;
      try {
        const token = (req as any).cookies?.['Authorization'] || (req.header('Authorization') ? req.header('Authorization')!.split('Bearer ')[1] : null);
        if (token) {
          const decoded = verify(token, SECRET_KEY) as DataStoredInToken;
          userId = decoded?._id?.toString?.();
        }
      } catch (_) {
      }
      const ip = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
      return userId ? `user:${userId}` : `ip:${ip}`;
    },
    handler: (req: Request, res: Response, next: NextFunction, options: any) => {
      res.status(429).json(options.message);
    },
  });
};
export const defaultLimiter = rateLimiter();
export const strictLimiter = rateLimiter(15 * 60 * 1000, 50);
export const authLimiter = rateLimiter(15 * 60 * 1000, 100, {
  status: 429,
  error: 'Too many login attempts. Try again later.',
});
export const securityLimiter = rateLimiter(5 * 60 * 1000, 10, {
  status: 429,
  error: 'Too many requests. Access temporarily restricted.',
});
export const rootPathLimiter = rateLimiter(1 * 60 * 1000, 5, {
  status: 429,
  error: 'Too many requests to root path.',
});