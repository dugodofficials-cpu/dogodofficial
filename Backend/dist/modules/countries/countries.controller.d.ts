import { NextFunction, Request, Response } from 'express';
import CountryService from '../../modules/countries/countries.service';
declare class CountriesController {
    countryService: CountryService;
    getCountries: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCountryById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCountryByCode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createCountry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateCountry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCountry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default CountriesController;
