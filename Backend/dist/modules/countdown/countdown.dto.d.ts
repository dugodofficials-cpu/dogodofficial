import { CountdownStatus } from '../../modules/countdown/countdown.interface';
export declare class CreateCountdownDto {
    title: string;
    description?: string;
    launchDate: string;
    status?: CountdownStatus;
    isActive?: boolean;
    backgroundImage?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonText?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    showDays?: boolean;
    showHours?: boolean;
    showMinutes?: boolean;
    showSeconds?: boolean;
    timezone?: string;
    customMessage?: string;
}
export declare class UpdateCountdownDto extends CreateCountdownDto {
}
export declare class GetCountdownsQueryDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    isActive?: boolean;
    search?: string;
}
