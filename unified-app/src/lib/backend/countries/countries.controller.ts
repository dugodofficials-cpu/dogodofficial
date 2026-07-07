import { NextFunction, Request, Response } from 'express';
import { CreateCountryDto, UpdateCountryDto, GetCountriesQueryDto } from '@backend/countries/countries.dto';
import { Country } from '@backend/countries/countries.interface';
import CountryService from '@backend/countries/countries.service';
class CountriesController {
  public countryService = new CountryService();
  public getCountries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: GetCountriesQueryDto = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as 'name' | 'code' | 'currency' | 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      const { countries, total, page, limit, totalPages } = await this.countryService.findAllCountries(query);
      res.status(200).json({
        data: countries,
        meta: {
          total,
          page,
          limit,
          totalPages
        },
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };
  public getCountryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countryId: string = req.params.id;
      const findOneCountryData: Country = await this.countryService.findCountryById(countryId);
      res.status(200).json({ data: findOneCountryData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public getCountryByCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countryCode: string = req.params.code;
      const findOneCountryData: Country = await this.countryService.findCountryByCode(countryCode);
      res.status(200).json({ data: findOneCountryData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public createCountry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countryData: CreateCountryDto = req.body;
      const createCountryData: Country = await this.countryService.createCountry(countryData);
      res.status(201).json({ data: createCountryData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateCountry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countryId: string = req.params.id;
      const countryData: UpdateCountryDto = req.body;
      const updateCountryData: Country = await this.countryService.updateCountry(countryId, countryData);
      res.status(200).json({ data: updateCountryData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteCountry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countryId: string = req.params.id;
      const deleteCountryData: Country = await this.countryService.deleteCountry(countryId);
      res.status(200).json({ data: deleteCountryData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
export default CountriesController;