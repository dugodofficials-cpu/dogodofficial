import { Router } from 'express';
import CountriesController from '@backend/countries/countries.controller';
import { CreateCountryDto, UpdateCountryDto, GetCountriesQueryDto } from '@backend/countries/countries.dto';
import { Routes } from '@backend/interfaces/routes.interface';
import validationMiddleware from '@backend/middlewares/validation.middleware';
class CountriesRoute implements Routes {
  public path = '/countries';
  public router = Router();
  public countriesController = new CountriesController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, validationMiddleware(GetCountriesQueryDto, 'query'), this.countriesController.getCountries);
    this.router.get(`${this.path}/:id`, this.countriesController.getCountryById);
    this.router.get(`${this.path}/code/:code`, this.countriesController.getCountryByCode);
    this.router.post(`${this.path}`, validationMiddleware(CreateCountryDto, 'body'), this.countriesController.createCountry);
    this.router.put(`${this.path}/:id`, validationMiddleware(UpdateCountryDto, 'body', true), this.countriesController.updateCountry);
    this.router.delete(`${this.path}/:id`, this.countriesController.deleteCountry);
  }
}
export default CountriesRoute;