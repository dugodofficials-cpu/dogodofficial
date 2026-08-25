import { Router } from 'express';
import CountriesController from '@backend/countries/countries.controller';
import { CreateCountryDto, UpdateCountryDto, GetCountriesQueryDto } from '@backend/countries/countries.dto';
import { Routes } from '@backend/interfaces/routes.interface';
import validationMiddleware from '@backend/middlewares/validation.middleware';
import authMiddleware from '@backend/middlewares/auth.middleware';
import { hasPermission } from '@backend/middlewares/permission.middleware';
import { Permission } from '@backend/roles/roles.interface';
class CountriesRoute implements Routes {
  public path = '/countries';
  public router = Router();
  public countriesController = new CountriesController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    const manage = hasPermission(Permission.MANAGE_SHIPPING_LOCATIONS);
    // Country list/detail stay public — checkout's address/shipping-country
    // pickers need them before a customer is signed in.
    this.router.get(`${this.path}`, validationMiddleware(GetCountriesQueryDto, 'query'), this.countriesController.getCountries);
    this.router.get(`${this.path}/:id`, this.countriesController.getCountryById);
    this.router.get(`${this.path}/code/:code`, this.countriesController.getCountryByCode);
    this.router.post(`${this.path}`, [authMiddleware, manage], validationMiddleware(CreateCountryDto, 'body'), this.countriesController.createCountry);
    this.router.put(`${this.path}/:id`, [authMiddleware, manage], validationMiddleware(UpdateCountryDto, 'body', true), this.countriesController.updateCountry);
    this.router.delete(`${this.path}/:id`, [authMiddleware, manage], this.countriesController.deleteCountry);
  }
}
export default CountriesRoute;