"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HttpException_1 = require("../../exceptions/HttpException");
const countries_model_1 = tslib_1.__importDefault(require("../../modules/countries/countries.model"));
const util_1 = require("../../utils/util");
class CountryService {
    constructor() {
        this.countries = countries_model_1.default;
    }
    async findAllCountries(query = {}) {
        const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc', } = query;
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { currency: { $regex: search, $options: 'i' } },
                { phoneCode: { $regex: search, $options: 'i' } },
                { region: { $in: [new RegExp(search, 'i')] } },
            ];
        }
        const sort = {
            [sortBy]: sortOrder === 'desc' ? -1 : 1,
        };
        const skip = (page - 1) * limit;
        const [countries, total] = await Promise.all([
            this.countries
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit),
            this.countries.countDocuments(filter),
        ]);
        return {
            countries,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findCountryById(countryId) {
        if ((0, util_1.isEmpty)(countryId))
            throw new HttpException_1.HttpException(400, 'CountryId is empty');
        const findCountry = await this.countries.findOne({ _id: countryId });
        if (!findCountry)
            throw new HttpException_1.HttpException(409, "Country doesn't exist");
        return findCountry;
    }
    async findCountryByCode(code) {
        if ((0, util_1.isEmpty)(code))
            throw new HttpException_1.HttpException(400, 'Country code is empty');
        const findCountry = await this.countries.findOne({ code: code.toUpperCase() });
        if (!findCountry)
            throw new HttpException_1.HttpException(409, "Country doesn't exist");
        return findCountry;
    }
    async createCountry(countryData) {
        if ((0, util_1.isEmpty)(countryData))
            throw new HttpException_1.HttpException(400, 'countryData is empty');
        const findCountry = await this.countries.findOne({ code: countryData.code.toUpperCase() });
        if (findCountry)
            throw new HttpException_1.HttpException(409, `Country with code ${countryData.code} already exists`);
        const createCountryData = await this.countries.create(Object.assign(Object.assign({}, countryData), { code: countryData.code.toUpperCase(), currency: countryData.currency.toUpperCase() }));
        return createCountryData;
    }
    async updateCountry(countryId, countryData) {
        if ((0, util_1.isEmpty)(countryData))
            throw new HttpException_1.HttpException(400, 'countryData is empty');
        if (countryData.code) {
            const findCountry = await this.countries.findOne({ code: countryData.code.toUpperCase() });
            if (findCountry && findCountry._id != countryId) {
                throw new HttpException_1.HttpException(409, `Country with code ${countryData.code} already exists`);
            }
            countryData.code = countryData.code.toUpperCase();
        }
        if (countryData.currency) {
            countryData.currency = countryData.currency.toUpperCase();
        }
        const updateCountryById = await this.countries.findByIdAndUpdate(countryId, countryData, { new: true });
        if (!updateCountryById)
            throw new HttpException_1.HttpException(409, "Country doesn't exist");
        return updateCountryById;
    }
    async deleteCountry(countryId) {
        const deleteCountryById = await this.countries.findByIdAndDelete(countryId);
        if (!deleteCountryById)
            throw new HttpException_1.HttpException(409, "Country doesn't exist");
        return deleteCountryById;
    }
}
exports.default = CountryService;
//# sourceMappingURL=countries.service.js.map