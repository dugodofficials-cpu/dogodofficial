import { NextFunction, Request, Response } from 'express';
import BlackboxService from '../../modules/blackbox/blackbox.service';
import { RequestWithUser } from '../../modules/auth/auth.interface';
declare class BlackboxController {
    blackboxService: BlackboxService;
    createQuestion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getQuestions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getQuestionById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateQuestion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteQuestion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    reorderQuestions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    answerQuestion: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    getUserProgress: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    getAnsweredQuestions: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    getNextUnansweredQuestion: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    resetUserProgress: (req: RequestWithUser, res: Response, next: NextFunction) => Promise<void>;
    getQuestionStatistics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default BlackboxController;
