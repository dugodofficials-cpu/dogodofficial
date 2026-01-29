import CountdownController from '../../modules/countdown/countdown.controller';
import { Routes } from '../../interfaces/routes.interface';
declare class CountdownRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    countdownController: CountdownController;
    constructor();
    private initializeRoutes;
}
export default CountdownRoute;
