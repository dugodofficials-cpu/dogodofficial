import { Routes } from '../../interfaces/routes.interface';
import RoleController from '../../modules/roles/roles.controller';
declare class RoleRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    roleController: RoleController;
    constructor();
    private initializeRoutes;
}
export default RoleRoute;
