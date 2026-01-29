export declare class CreateCountryDto {
    name: string;
    code: string;
    phoneCode: string;
    currency: string;
    region: string[];
    isActive: boolean;
}
export declare class UpdateCountryDto extends CreateCountryDto {
}
export declare class GetCountriesQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'name' | 'code' | 'currency' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
