import { EmailController } from './email.controller';
export declare class EmailRoute {
    path: string;
    router: import("express-serve-static-core").Router;
    email: EmailController;
    constructor();
    private initializeRoutes;
}
