/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { CreateCountryDto, UpdateCountryDto, GetCountriesQueryDto } from '../../modules/countries/countries.dto';
import { Country } from '../../modules/countries/countries.interface';
declare class CountryService {
    countries: import("mongoose").Model<Country & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    findAllCountries(query?: GetCountriesQueryDto): Promise<{
        countries: Country[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findCountryById(countryId: string): Promise<Country>;
    findCountryByCode(code: string): Promise<Country>;
    createCountry(countryData: CreateCountryDto): Promise<Country>;
    updateCountry(countryId: string, countryData: UpdateCountryDto): Promise<Country>;
    deleteCountry(countryId: string): Promise<Country>;
}
export default CountryService;
