export declare class AddressDto {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: AddressDto;
    country: string;
    status?: string;
    role?: string;
}
export declare class UpdateUserDto extends CreateUserDto {
}
export declare class GetUsersQueryDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    'address.city'?: string;
    'address.state'?: string;
    'address.country'?: string;
    country?: string;
    search?: string;
    role?: string;
    status?: string;
}
