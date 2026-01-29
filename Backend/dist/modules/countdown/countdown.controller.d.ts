import { NextFunction, Request, Response } from 'express';
import countdownService from '../../modules/countdown/countdown.service';
declare class CountdownController {
    countdownService: countdownService;
    getCountdownStatistics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCountdowns: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllCountdowns: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCountdownById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getActiveCountdown: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    getActiveCountdownWithTimeRemaining: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    getTimeRemaining: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createCountdown: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateCountdown: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCountdown: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateExpiredCountdowns: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    activateCountdown: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deactivateAllCountdowns: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default CountdownController;
