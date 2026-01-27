import { CreateCountryDto, UpdateCountryDto, GetCountriesQueryDto } from '@/modules/countries/countries.dto';
import { HttpException } from '@exceptions/HttpException';
import { Country } from '@/modules/countries/countries.interface';
import countryModel from '@/modules/countries/countries.model';
import { isEmpty } from '@utils/util';
class CountryService {
  public countries = countryModel;
  public async findAllCountries(query: GetCountriesQueryDto = {}): Promise<{ countries: Country[]; total: number; page: number; limit: number; totalPages: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { currency: { $regex: search, $options: 'i' } },
        { phoneCode: { $regex: search, $options: 'i' } },
        { region: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    const sort: any = {
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
  public async findCountryById(countryId: string): Promise<Country> {
    if (isEmpty(countryId)) throw new HttpException(400, 'CountryId is empty');
    const findCountry: Country = await this.countries.findOne({ _id: countryId });
    if (!findCountry) throw new HttpException(409, "Country doesn't exist");
    return findCountry;
  }
  public async findCountryByCode(code: string): Promise<Country> {
    if (isEmpty(code)) throw new HttpException(400, 'Country code is empty');
    const findCountry: Country = await this.countries.findOne({ code: code.toUpperCase() });
    if (!findCountry) throw new HttpException(409, "Country doesn't exist");
    return findCountry;
  }
  public async createCountry(countryData: CreateCountryDto): Promise<Country> {
    if (isEmpty(countryData)) throw new HttpException(400, 'countryData is empty');
    const findCountry: Country = await this.countries.findOne({ code: countryData.code.toUpperCase() });
    if (findCountry) throw new HttpException(409, `Country with code ${countryData.code} already exists`);
    const createCountryData: Country = await this.countries.create({
      ...countryData,
      code: countryData.code.toUpperCase(),
      currency: countryData.currency.toUpperCase(),
    });
    return createCountryData;
  }
  public async updateCountry(countryId: string, countryData: UpdateCountryDto): Promise<Country> {
    if (isEmpty(countryData)) throw new HttpException(400, 'countryData is empty');
    if (countryData.code) {
      const findCountry: Country = await this.countries.findOne({ code: countryData.code.toUpperCase() });
      if (findCountry && findCountry._id != countryId) {
        throw new HttpException(409, `Country with code ${countryData.code} already exists`);
      }
      countryData.code = countryData.code.toUpperCase();
    }
    if (countryData.currency) {
      countryData.currency = countryData.currency.toUpperCase();
    }
    const updateCountryById: Country = await this.countries.findByIdAndUpdate(countryId, countryData, { new: true });
    if (!updateCountryById) throw new HttpException(409, "Country doesn't exist");
    return updateCountryById;
  }
  public async deleteCountry(countryId: string): Promise<Country> {
    const deleteCountryById: Country = await this.countries.findByIdAndDelete(countryId);
    if (!deleteCountryById) throw new HttpException(409, "Country doesn't exist");
    return deleteCountryById;
  }
}
export default CountryService;