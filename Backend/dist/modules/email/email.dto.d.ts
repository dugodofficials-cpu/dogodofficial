export declare class SendEmailDto {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    htmlContent?: string;
    textContent?: string;
    templateName?: string;
    variables?: Record<string, any>;
}
export declare class SendTemplateEmailDto {
    templateName: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    variables: Record<string, any>;
}
export declare class CreateTemplateDto {
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    variables: string[];
}
export declare class UpdateTemplateDto {
    name?: string;
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    variables?: string[];
    isActive?: boolean;
}
export declare class GetEmailLogsQueryDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    templateName?: string;
    to?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}
export declare class GetTemplatesQueryDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    name?: string;
    isActive?: boolean;
    search?: string;
}
