import CountriesController from '../../modules/countries/countries.controller';
import { Routes } from '../../interfaces/routes.interface';
declare class CountriesRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    countriesController: CountriesController;
    constructor();
    private initializeRoutes;
}
export default CountriesRoute;
