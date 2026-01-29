"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const countries_service_1 = tslib_1.__importDefault(require("../../modules/countries/countries.service"));
class CountriesController {
    constructor() {
        this.countryService = new countries_service_1.default();
        this.getCountries = async (req, res, next) => {
            try {
                const query = {
                    page: req.query.page ? parseInt(req.query.page) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                    search: req.query.search,
                    sortBy: req.query.sortBy,
                    sortOrder: req.query.sortOrder,
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
            }
            catch (error) {
                next(error);
            }
        };
        this.getCountryById = async (req, res, next) => {
            try {
                const countryId = req.params.id;
                const findOneCountryData = await this.countryService.findCountryById(countryId);
                res.status(200).json({ data: findOneCountryData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getCountryByCode = async (req, res, next) => {
            try {
                const countryCode = req.params.code;
                const findOneCountryData = await this.countryService.findCountryByCode(countryCode);
                res.status(200).json({ data: findOneCountryData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createCountry = async (req, res, next) => {
            try {
                const countryData = req.body;
                const createCountryData = await this.countryService.createCountry(countryData);
                res.status(201).json({ data: createCountryData, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateCountry = async (req, res, next) => {
            try {
                const countryId = req.params.id;
                const countryData = req.body;
                const updateCountryData = await this.countryService.updateCountry(countryId, countryData);
                res.status(200).json({ data: updateCountryData, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteCountry = async (req, res, next) => {
            try {
                const countryId = req.params.id;
                const deleteCountryData = await this.countryService.deleteCountry(countryId);
                res.status(200).json({ data: deleteCountryData, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = CountriesController;
//# sourceMappingURL=countries.controller.js.map