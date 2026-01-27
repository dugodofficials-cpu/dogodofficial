import { Document, Types } from 'mongoose';
export interface EmailTemplate {
  _id: Types.ObjectId;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface EmailLog {
  _id: Types.ObjectId;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: Types.ObjectId;
  templateName?: string;
  variables?: Record<string, any>;
  status: 'sent' | 'failed' | 'pending';
  provider: 'zepto' | 'resend';
  errorMessage?: string;
  zeptoMessageId?: string;
  resendMessageId?: string;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface SendEmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateName?: string;
  variables?: Record<string, any>;
}
export interface SendTemplateEmailRequest {
  templateName: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  variables: Record<string, any>;
}
export interface CreateTemplateRequest {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
}
export interface UpdateTemplateRequest {
  name?: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: string[];
  isActive?: boolean;
}
export interface EmailFilters {
  status?: 'sent' | 'failed' | 'pending';
  templateName?: string;
  to?: string;
  provider?: 'zepto' | 'resend';
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  isActive?: boolean;
  name?: string;
  subject?: string;
  variables?: string[];
}
export interface EmailSort {
  field: string;
  order: 'asc' | 'desc';
}
export interface PaginationParams {
  page: number;
  limit: number;
}
export interface EmailQueryParams {
  filters?: EmailFilters;
  sort?: EmailSort;
  pagination?: PaginationParams;
}
export interface PaginatedEmailLogsResponse {
  data: EmailLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}
export interface PaginatedTemplatesResponse {
  data: EmailTemplate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}
export type EmailTemplateDocument = Document & EmailTemplate;
export type EmailLogDocument = Document & EmailLog;