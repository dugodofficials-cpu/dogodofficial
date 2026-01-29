import { Document, Types } from 'mongoose';
export declare enum CountdownStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired"
}
export interface Countdown {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    launchDate: Date;
    status: CountdownStatus;
    isActive: boolean;
    backgroundImage?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonText?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    showDays: boolean;
    showHours: boolean;
    showMinutes: boolean;
    showSeconds: boolean;
    timezone: string;
    customMessage?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export type CountdownDocument = Document & Countdown;
export interface CountdownFilters {
    status?: string;
    isActive?: boolean;
    search?: string;
}
export interface CountdownSort {
    field: string;
    order: 'asc' | 'desc';
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface CountdownQueryParams {
    filters?: CountdownFilters;
    sort?: CountdownSort;
    pagination?: PaginationParams;
}
export interface PaginatedCountdownResponse {
    data: Countdown[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}
export interface CountdownTimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
    isExpired: boolean;
}
