import { NextFunction, Request, Response } from 'express';
import EmailService from './email.service';
export declare class EmailController {
    email: EmailService;
    sendEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    sendTemplateEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTemplates: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTemplateById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteTemplate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEmailLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEmailLogById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resendEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
