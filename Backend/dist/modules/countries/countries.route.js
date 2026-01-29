"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const countries_controller_1 = tslib_1.__importDefault(require("../../modules/countries/countries.controller"));
const countries_dto_1 = require("../../modules/countries/countries.dto");
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
class CountriesRoute {
    constructor() {
        this.path = '/countries';
        this.router = (0, express_1.Router)();
        this.countriesController = new countries_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, (0, validation_middleware_1.default)(countries_dto_1.GetCountriesQueryDto, 'query'), this.countriesController.getCountries);
        this.router.get(`${this.path}/:id`, this.countriesController.getCountryById);
        this.router.get(`${this.path}/code/:code`, this.countriesController.getCountryByCode);
        this.router.post(`${this.path}`, (0, validation_middleware_1.default)(countries_dto_1.CreateCountryDto, 'body'), this.countriesController.createCountry);
        this.router.put(`${this.path}/:id`, (0, validation_middleware_1.default)(countries_dto_1.UpdateCountryDto, 'body', true), this.countriesController.updateCountry);
        this.router.delete(`${this.path}/:id`, this.countriesController.deleteCountry);
    }
}
exports.default = CountriesRoute;
//# sourceMappingURL=countries.route.js.map