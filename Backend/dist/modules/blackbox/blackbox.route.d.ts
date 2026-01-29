import BlackboxController from '../../modules/blackbox/blackbox.controller';
import { Routes } from '../../interfaces/routes.interface';
declare class BlackboxRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    blackboxController: BlackboxController;
    constructor();
    private initializeRoutes;
}
export default BlackboxRoute;
