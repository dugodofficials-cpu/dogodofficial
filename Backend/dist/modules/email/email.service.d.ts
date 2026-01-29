import { SendEmailRequest, SendTemplateEmailRequest, CreateTemplateRequest, UpdateTemplateRequest, EmailTemplate, EmailLog, EmailQueryParams, PaginatedEmailLogsResponse, PaginatedTemplatesResponse } from './email.interface';
declare class EmailService {
    private zeptoClient;
    private resendClient;
    constructor();
    private initializeDefaultTemplates;
    private determineEmailProvider;
    sendEmail(emailData: SendEmailRequest): Promise<EmailLog>;
    sendEmailWithProvider(emailData: SendEmailRequest, provider: 'zepto' | 'resend'): Promise<EmailLog>;
    private sendViaZepto;
    private sendViaResend;
    sendTemplateEmail(templateData: SendTemplateEmailRequest): Promise<EmailLog>;
    createTemplate(templateData: CreateTemplateRequest): Promise<EmailTemplate>;
    createDefaultVerificationTemplate(): Promise<EmailTemplate>;
    createDefaultPasswordResetTemplate(): Promise<EmailTemplate>;
    getTemplates(queryParams: EmailQueryParams): Promise<PaginatedTemplatesResponse>;
    getTemplateById(templateId: string): Promise<EmailTemplate>;
    updateTemplate(templateId: string, templateData: UpdateTemplateRequest): Promise<EmailTemplate>;
    deleteTemplate(templateId: string): Promise<EmailTemplate>;
    getEmailLogs(queryParams: EmailQueryParams): Promise<PaginatedEmailLogsResponse>;
    getEmailLogById(logId: string): Promise<EmailLog>;
    resendEmail(logId: string): Promise<EmailLog>;
    getEmailLogsByProvider(provider: 'zepto' | 'resend', queryParams: EmailQueryParams): Promise<PaginatedEmailLogsResponse>;
    getEmailStats(): Promise<{
        total: number;
        sent: number;
        failed: number;
        pending: number;
        byProvider: {
            zepto: {
                total: number;
                sent: number;
                failed: number;
                pending: number;
            };
            resend: {
                total: number;
                sent: number;
                failed: number;
                pending: number;
            };
        };
    }>;
}
export default EmailService;
