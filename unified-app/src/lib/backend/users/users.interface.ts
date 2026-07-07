import { Document, Types } from 'mongoose';
import { Country } from '@backend/countries/countries.interface';
import { Role, UserRole } from '@backend/roles/roles.interface';
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}
export interface User {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  picture: string;
  status: string;
  role: Role | Types.ObjectId;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  country: Country | string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  totalOrdersCount?: number;
  userRoles?: UserRole[];
  createdAt?: Date;
  updatedAt?: Date;
}
export type UserDocument = Document & User;
export interface UserFilters {
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
export interface UserSort {
  field: string;
  order: 'asc' | 'desc';
}
export interface PaginationParams {
  page: number;
  limit: number;
}
export interface UserQueryParams {
  filters?: UserFilters;
  sort?: UserSort;
  pagination?: PaginationParams;
}
export interface PaginatedUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}