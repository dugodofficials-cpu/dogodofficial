import { NextFunction, Request, Response } from 'express';
interface SecurityConfig {
    blockSuspiciousQueries: boolean;
    blockPathTraversal: boolean;
    blockAirflowExploits: boolean;
    logSuspiciousActivity: boolean;
    strictMode: boolean;
}
export declare const securityMiddleware: (config?: Partial<SecurityConfig>) => (req: Request, res: Response, next: NextFunction) => void;
export declare const strictSecurity: (req: Request, res: Response, next: NextFunction) => void;
export declare const basicSecurity: (req: Request, res: Response, next: NextFunction) => void;
export default securityMiddleware;
