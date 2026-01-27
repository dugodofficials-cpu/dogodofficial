import { NextFunction, Request, Response } from 'express';
import { logger } from '@/utils/logger';
class IndexController {
  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info(`health check from ${req.ip}`);
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      next(error);
    }
  };
}
export default IndexController;