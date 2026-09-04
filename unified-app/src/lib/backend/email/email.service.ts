import { SendMailClient } from 'zeptomail';
import { Resend } from 'resend';
import { HttpException } from '@backend/exceptions/HttpException';
import { isEmpty } from '@backend/utils/util';
import emailModel from './email.model';
import { logger } from '@backend/utils/logger';
const appConfig = {
  zepto: {
    apiToken: process.env.ZEPTO_API_TOKEN,
    domain: process.env.ZEPTO_DOMAIN,
    url: process.env.ZEPTO_URL || 'https://api.zeptomail.com'
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    domain: process.env.RESEND_DOMAIN || process.env.ZEPTO_DOMAIN || 'dugod.com'
  }
};
import {
  SendEmailRequest,
  SendTemplateEmailRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  EmailTemplate,
  EmailLog,
  EmailQueryParams,
  PaginatedEmailLogsResponse,
  PaginatedTemplatesResponse,
} from './email.interface';
class EmailService {
  private zeptoClient: any;
  private resendClient: any;
  constructor() {
    // The zeptomail SDK builds its request URL as `host + "v1.1/email"` with
    // no separator in between, so a host without a trailing slash (e.g. the
    // exact value in .env.production/.env.local, "https://api.zeptomail.com")
    // silently produces "https://api.zeptomail.comv1.1/email" — a
    // non-existent hostname. The fetch() then rejects with a network error,
    // which the SDK's own error handler crashes on trying to call
    // `.json()` on it, so the promise never settles: every real signup /
    // password reset / order-confirmation email hung for ~2 minutes before
    // timing out. Confirmed live by tracing the actual malformed URL and by
    // signing up a real test account against the real ZeptoMail config.
    const zeptoUrl = appConfig?.zepto?.url || 'https://api.zeptomail.com';
    this.zeptoClient = new SendMailClient({
      url: zeptoUrl.endsWith('/') ? zeptoUrl : `${zeptoUrl}/`,
      token: appConfig?.zepto?.apiToken || '',
    });
    this.resendClient = appConfig?.resend?.apiKey ? new Resend(appConfig.resend.apiKey) : null;
    this.initializeDefaultTemplates();
  }
  private async initializeDefaultTemplates(): Promise<void> {
    try {
      await this.createDefaultVerificationTemplate();
      await this.createDefaultPasswordResetTemplate();
      await this.createDefaultWelcomeTemplate();
      logger.info('Default email templates initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize default email templates:', error.message);
    }
  }
  private getReadableErrorMessage(error: any): string {
    // ZeptoMail's SDK rejects with the raw parsed API error body on a
    // real API-level failure (e.g. { error: { message, details } }), not
    // a JS Error — `error.message` is undefined for that shape, which
    // previously logged every failure as the unhelpful "Unknown error
    // occurred" no matter what actually went wrong (invalid token, domain
    // not verified, credits exhausted, etc.).
    return (
      error?.message ||
      error?.error?.details?.[0]?.message ||
      error?.error?.message ||
      'Unknown error occurred'
    );
  }
  private determineEmailProvider(): 'zepto' | 'resend' {
    const zeptoConfigured = appConfig?.zepto?.apiToken && appConfig?.zepto?.domain;
    const resendConfigured = appConfig?.resend?.apiKey && appConfig?.resend?.domain;
    if (zeptoConfigured && resendConfigured) {
      return process.env.PREFERRED_EMAIL_PROVIDER === 'resend' ? 'resend' : 'zepto';
    }
    if (resendConfigured) {
      return 'resend';
    }
    if (zeptoConfigured) {
      return 'zepto';
    }
    throw new Error('No email provider configured. Please check ZEPTO_API_TOKEN and ZEPTO_DOMAIN or RESEND_API_KEY and RESEND_DOMAIN environment variables.');
  }
  public async sendEmail(emailData: SendEmailRequest): Promise<EmailLog> {
    if (isEmpty(emailData)) throw new HttpException(400, 'Email data is empty');
    const provider = this.determineEmailProvider();
    const emailLog = await emailModel.EmailLog.create({
      to: emailData.to,
      cc: emailData.cc || [],
      bcc: emailData.bcc || [],
      subject: emailData.subject,
      htmlContent: emailData.htmlContent || '',
      textContent: emailData.textContent || '',
      templateName: emailData.templateName,
      variables: emailData.variables || {},
      status: 'pending',
      provider,
    });
    try {
      if (provider === 'zepto') {
        return await this.sendViaZepto(emailData, emailLog);
      } else if (provider === 'resend') {
        return await this.sendViaResend(emailData, emailLog);
      } else {
        throw new Error(`Unsupported email provider: ${provider}`);
      }
    } catch (error) {
      const readableMessage = this.getReadableErrorMessage(error);
      logger.error(`Failed to send email via ${provider}: ${readableMessage}`);
      const updatedLog = await emailModel.EmailLog.findByIdAndUpdate(
        emailLog._id,
        {
          status: 'failed',
          errorMessage: readableMessage,
        },
        { new: true }
      );
      throw new HttpException(500, `Failed to send email via ${provider}: ${readableMessage}`);
    }
  }
  public async sendEmailWithProvider(emailData: SendEmailRequest, provider: 'zepto' | 'resend'): Promise<EmailLog> {
    if (isEmpty(emailData)) throw new HttpException(400, 'Email data is empty');
    if (provider === 'zepto' && (!appConfig?.zepto?.apiToken || !appConfig?.zepto?.domain)) {
      throw new HttpException(400, 'ZeptoMail configuration is incomplete. Please check ZEPTO_API_TOKEN and ZEPTO_DOMAIN environment variables.');
    }
    if (provider === 'resend' && (!appConfig?.resend?.apiKey || !appConfig?.resend?.domain)) {
      throw new HttpException(400, 'Resend configuration is incomplete. Please check RESEND_API_KEY and RESEND_DOMAIN environment variables.');
    }
    const emailLog = await emailModel.EmailLog.create({
      to: emailData.to,
      cc: emailData.cc || [],
      bcc: emailData.bcc || [],
      subject: emailData.subject,
      htmlContent: emailData.htmlContent || '',
      textContent: emailData.textContent || '',
      templateName: emailData.templateName,
      variables: emailData.variables || {},
      status: 'pending',
      provider,
    });
    try {
      if (provider === 'zepto') {
        return await this.sendViaZepto(emailData, emailLog);
      } else if (provider === 'resend') {
        return await this.sendViaResend(emailData, emailLog);
      } else {
        throw new Error(`Unsupported email provider: ${provider}`);
      }
    } catch (error) {
      const readableMessage = this.getReadableErrorMessage(error);
      logger.error(`Failed to send email via ${provider}: ${readableMessage}`);
      await emailModel.EmailLog.findByIdAndUpdate(
        emailLog._id,
        {
          status: 'failed',
          errorMessage: readableMessage,
        },
        { new: true }
      );
      throw new HttpException(500, `Failed to send email via ${provider}: ${readableMessage}`);
    }
  }
  private async sendViaZepto(emailData: SendEmailRequest, emailLog: any): Promise<EmailLog> {
    if (!appConfig?.zepto?.apiToken || !appConfig?.zepto?.domain) {
      throw new Error('ZeptoMail configuration is incomplete. Please check ZEPTO_API_TOKEN and ZEPTO_DOMAIN environment variables.');
    }
    const mailData = {
      from: {
        address: `noreply@${appConfig.zepto.domain}`,
        name: 'Dugod Service',
      },
      to: emailData.to.map(email => ({ email_address: { address: email } })),
      cc: emailData.cc?.map(email => ({ email_address: { address: email } })) || [],
      bcc: emailData.bcc?.map(email => ({ email_address: { address: email } })) || [],
      subject: emailData.subject,
      htmlbody: emailData.htmlContent,
      textbody: emailData.textContent,
    };
    logger.info(`Attempting to send email via ZeptoMail: ${emailData.to} ${emailData.subject} ${appConfig.zepto.domain}`);
    const response = await this.zeptoClient.sendMail(mailData);
    logger.info('Email sent successfully via ZeptoMail:', response.message_id);
    const updatedLog = await emailModel.EmailLog.findByIdAndUpdate(
      emailLog._id,
      {
        status: 'sent',
        zeptoMessageId: response.message_id,
        sentAt: new Date(),
      },
      { new: true }
    );
    return updatedLog!;
  }
  private async sendViaResend(emailData: SendEmailRequest, emailLog: any): Promise<EmailLog> {
    if (!appConfig?.resend?.apiKey || !appConfig?.resend?.domain) {
      throw new Error('Resend configuration is incomplete. Please check RESEND_API_KEY and RESEND_DOMAIN environment variables.');
    }
    const mailData = {
      from: `noreply@${appConfig.resend.domain}`,
      to: emailData.to,
      cc: emailData.cc,
      bcc: emailData.bcc,
      subject: emailData.subject,
      html: emailData.htmlContent,
      text: emailData.textContent,
    };
    logger.info(`Attempting to send email via Resend: ${emailData.to} ${emailData.subject} ${appConfig.resend.domain}`);
    const response = await this.resendClient.emails.send(mailData);
    logger.info('Email sent successfully via Resend:', response.id);
    const updatedLog = await emailModel.EmailLog.findByIdAndUpdate(
      emailLog._id,
      {
        status: 'sent',
        resendMessageId: response.id,
        sentAt: new Date(),
      },
      { new: true }
    );
    return updatedLog!;
  }
  public async sendTemplateEmail(templateData: SendTemplateEmailRequest): Promise<EmailLog> {
    if (isEmpty(templateData)) throw new HttpException(400, 'Template data is empty');
    const template = await emailModel.EmailTemplate.findOne({
      name: templateData.templateName,
      isActive: true,
    });
    if (!template) {
      throw new HttpException(404, `Template '${templateData.templateName}' not found or inactive`);
    }
    const missingVariables = template.variables.filter(
      variable => !templateData.variables.hasOwnProperty(variable)
    );
    if (missingVariables.length > 0) {
      throw new HttpException(400, `Missing required variables: ${missingVariables.join(', ')}`);
    }
    let htmlContent = template.htmlContent;
    let textContent = template.textContent || '';
    let subject = template.subject;
    Object.entries(templateData.variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, value);
      textContent = textContent.replace(regex, value);
      subject = subject.replace(regex, value);
    });
    return this.sendEmail({
      to: templateData.to,
      cc: templateData.cc,
      bcc: templateData.bcc,
      subject,
      htmlContent,
      textContent,
      templateName: templateData.templateName,
      variables: templateData.variables,
    });
  }
  public async createTemplate(templateData: CreateTemplateRequest): Promise<EmailTemplate> {
    if (isEmpty(templateData)) throw new HttpException(400, 'Template data is empty');
    const existingTemplate = await emailModel.EmailTemplate.findOne({ name: templateData.name });
    if (existingTemplate) {
      throw new HttpException(409, `Template with name '${templateData.name}' already exists`);
    }
    const template = await emailModel.EmailTemplate.create(templateData);
    return template;
  }
  public async createDefaultVerificationTemplate(): Promise<EmailTemplate> {
    const templateName = 'email-verification';
    const existingTemplate = await emailModel.EmailTemplate.findOne({ name: templateName });
    if (existingTemplate) {
      return existingTemplate;
    }
    const templateData: CreateTemplateRequest = {
      name: templateName,
      subject: 'Verify Your Email Address - Dugod',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Dugod</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Dugod Official!</h1>
            </div>
            <div class="content">
              <p>Thank you for signing up! To complete your registration, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #007bff;">{{verificationUrl}}</p>
              <p><strong>This link will expire in {{expiryHours}} hours.</strong></p>
              <p>If you didn't create an account with Dugod, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Dugod. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
Welcome to Dugod!
Thank you for signing up! To complete your registration, please verify your email address by visiting this link:
{{verificationUrl}}
This link will expire in {{expiryHours}} hours.
If you didn't create an account with Dugod, you can safely ignore this email.
Best regards,
The Dugod Team
      `,
      variables: ['firstName', 'verificationUrl', 'expiryHours'],
    };
    return this.createTemplate(templateData);
  }
  public async createDefaultPasswordResetTemplate(): Promise<EmailTemplate> {
    const templateName = 'password-reset';
    const existingTemplate = await emailModel.EmailTemplate.findOne({ name: templateName });
    if (existingTemplate) {
      return existingTemplate;
    }
    const templateData: CreateTemplateRequest = {
      name: templateName,
      subject: 'Reset Your Password - Dugod',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - Dugod</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello {{firstName}},</p>
              <p>We received a request to reset your password for your Dugod account. If you made this request, please click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="{{resetUrl}}" class="button">Reset Password</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #dc3545;">{{resetUrl}}</p>
              <div class="warning">
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This link will expire in {{expiryHours}} hour.</li>
                  <li>If you didn't request a password reset, please ignore this email.</li>
                  <li>Your password will remain unchanged if you don't click the reset link.</li>
                </ul>
              </div>
              <p>For security reasons, this link can only be used once. If you need to reset your password again, please request a new reset link.</p>
              <p>If you have any questions or concerns, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Dugod. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
Password Reset Request - Dugod
Hello {{firstName}},
We received a request to reset your password for your Dugod account. If you made this request, please visit the following link to reset your password:
{{resetUrl}}
IMPORTANT:
- This link will expire in {{expiryHours}} hour.
- If you didn't request a password reset, please ignore this email.
- Your password will remain unchanged if you don't use the reset link.
- This link can only be used once.
For security reasons, this link can only be used once. If you need to reset your password again, please request a new reset link.
If you have any questions or concerns, please contact our support team.
Best regards,
The Dugod Team
---
This is an automated message, please do not reply to this email.
      `,
      variables: ['firstName', 'resetUrl', 'expiryHours'],
    };
    return this.createTemplate(templateData);
  }
  public async createDefaultWelcomeTemplate(): Promise<EmailTemplate> {
    const templateName = 'welcome';
    const existingTemplate = await emailModel.EmailTemplate.findOne({ name: templateName });
    if (existingTemplate) {
      return existingTemplate;
    }
    const templateData: CreateTemplateRequest = {
      name: templateName,
      subject: 'Welcome to Dugod!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Dugod</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0B6201; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #0B6201; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Dugod, {{firstName}}!</h1>
            </div>
            <div class="content">
              <p>Your account is ready to go — thanks for signing up.</p>
              <div style="text-align: center;">
                <a href="{{siteUrl}}" class="button">Start Exploring</a>
              </div>
              <p>If you have any questions or concerns, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Dugod. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
Welcome to Dugod, {{firstName}}!
Your account is ready to go — thanks for signing up.
Visit {{siteUrl}} to start exploring.
If you have any questions or concerns, please contact our support team.
Best regards,
The Dugod Team
      `,
      variables: ['firstName', 'siteUrl'],
    };
    return this.createTemplate(templateData);
  }
  public async getTemplates(queryParams: EmailQueryParams): Promise<PaginatedTemplatesResponse> {
    const { filters = {}, sort = { field: 'createdAt', order: 'desc' }, pagination = { page: 1, limit: 10 } } = queryParams;
    const filterObj: any = {};
    if (filters.name) {
      filterObj.name = { $regex: filters.name, $options: 'i' };
    }
    if (filters.isActive !== undefined) {
      filterObj.isActive = filters.isActive;
    }
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      filterObj.$or = [
        { name: searchRegex },
        { subject: searchRegex },
      ];
    }
    const sortObj: any = {};
    sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;
    const skip = (pagination.page - 1) * pagination.limit;
    const total = await emailModel.EmailTemplate.countDocuments(filterObj);
    const templates = await emailModel.EmailTemplate
      .find(filterObj)
      .sort(sortObj)
      .skip(skip)
      .limit(pagination.limit);
    const totalPages = Math.ceil(total / pagination.limit);
    return {
      data: templates,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
      message: 'success',
    };
  }
  public async getTemplateById(templateId: string): Promise<EmailTemplate> {
    if (isEmpty(templateId)) throw new HttpException(400, 'Template ID is empty');
    const template = await emailModel.EmailTemplate.findById(templateId);
    if (!template) throw new HttpException(404, 'Template not found');
    return template;
  }
  public async updateTemplate(templateId: string, templateData: UpdateTemplateRequest): Promise<EmailTemplate> {
    if (isEmpty(templateId)) throw new HttpException(400, 'Template ID is empty');
    if (isEmpty(templateData)) throw new HttpException(400, 'Template data is empty');
    const existingTemplate = await emailModel.EmailTemplate.findById(templateId);
    if (!existingTemplate) throw new HttpException(404, 'Template not found');
    if (templateData.name && templateData.name !== existingTemplate.name) {
      const nameConflict = await emailModel.EmailTemplate.findOne({ name: templateData.name });
      if (nameConflict) {
        throw new HttpException(409, `Template with name '${templateData.name}' already exists`);
      }
    }
    const updatedTemplate = await emailModel.EmailTemplate.findByIdAndUpdate(
      templateId,
      templateData,
      { new: true }
    );
    return updatedTemplate!;
  }
  public async deleteTemplate(templateId: string): Promise<EmailTemplate> {
    if (isEmpty(templateId)) throw new HttpException(400, 'Template ID is empty');
    const template = await emailModel.EmailTemplate.findByIdAndDelete(templateId);
    if (!template) throw new HttpException(404, 'Template not found');
    return template;
  }
  public async getEmailLogs(queryParams: EmailQueryParams): Promise<PaginatedEmailLogsResponse> {
    const { filters = {}, sort = { field: 'createdAt', order: 'desc' }, pagination = { page: 1, limit: 10 } } = queryParams;
    const filterObj: any = {};
    if (filters.status) {
      filterObj.status = filters.status;
    }
    if (filters.templateName) {
      filterObj.templateName = { $regex: filters.templateName, $options: 'i' };
    }
    if (filters.to) {
      filterObj.to = { $regex: filters.to, $options: 'i' };
    }
    if (filters.provider) {
      filterObj.provider = filters.provider;
    }
    if (filters.dateFrom || filters.dateTo) {
      filterObj.createdAt = {};
      if (filters.dateFrom) {
        filterObj.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        filterObj.createdAt.$lte = new Date(filters.dateTo);
      }
    }
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: 'i' };
      filterObj.$or = [
        { subject: searchRegex },
        { templateName: searchRegex },
        { to: searchRegex },
      ];
    }
    const sortObj: any = {};
    sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;
    const skip = (pagination.page - 1) * pagination.limit;
    const total = await emailModel.EmailLog.countDocuments(filterObj);
    const emailLogs = await emailModel.EmailLog
      .find(filterObj)
      .sort(sortObj)
      .skip(skip)
      .limit(pagination.limit);
    const totalPages = Math.ceil(total / pagination.limit);
    return {
      data: emailLogs,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
      message: 'success',
    };
  }
  public async getEmailLogById(logId: string): Promise<EmailLog> {
    if (isEmpty(logId)) throw new HttpException(400, 'Log ID is empty');
    const emailLog = await emailModel.EmailLog.findById(logId);
    if (!emailLog) throw new HttpException(404, 'Email log not found');
    return emailLog;
  }
  public async resendEmail(logId: string): Promise<EmailLog> {
    if (isEmpty(logId)) throw new HttpException(400, 'Log ID is empty');
    const emailLog = await emailModel.EmailLog.findById(logId);
    if (!emailLog) throw new HttpException(404, 'Email log not found');
    if (emailLog.status === 'sent') {
      throw new HttpException(400, 'Email has already been sent successfully');
    }
    await emailModel.EmailLog.findByIdAndUpdate(logId, { status: 'pending' });
    return this.sendEmailWithProvider({
      to: emailLog.to,
      cc: emailLog.cc,
      bcc: emailLog.bcc,
      subject: emailLog.subject,
      htmlContent: emailLog.htmlContent,
      textContent: emailLog.textContent,
      templateName: emailLog.templateName,
      variables: emailLog.variables,
    }, emailLog.provider);
  }
  public async getEmailLogsByProvider(provider: 'zepto' | 'resend', queryParams: EmailQueryParams): Promise<PaginatedEmailLogsResponse> {
    const filters = { ...queryParams.filters, provider };
    return this.getEmailLogs({ ...queryParams, filters });
  }
  public async getEmailStats(): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    byProvider: {
      zepto: { total: number; sent: number; failed: number; pending: number };
      resend: { total: number; sent: number; failed: number; pending: number };
    };
  }> {
    const [totalStats, zeptoStats, resendStats] = await Promise.all([
      emailModel.EmailLog.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      emailModel.EmailLog.aggregate([
        { $match: { provider: 'zepto' } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      emailModel.EmailLog.aggregate([
        { $match: { provider: 'resend' } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    const getStatusCount = (stats: any[], status: string) => {
      const stat = stats.find(s => s._id === status);
      return stat ? stat.count : 0;
    };
    const total = totalStats.reduce((sum, stat) => sum + stat.count, 0);
    const sent = getStatusCount(totalStats, 'sent');
    const failed = getStatusCount(totalStats, 'failed');
    const pending = getStatusCount(totalStats, 'pending');
    const zeptoTotal = zeptoStats.reduce((sum, stat) => sum + stat.count, 0);
    const zeptoSent = getStatusCount(zeptoStats, 'sent');
    const zeptoFailed = getStatusCount(zeptoStats, 'failed');
    const zeptoPending = getStatusCount(zeptoStats, 'pending');
    const resendTotal = resendStats.reduce((sum, stat) => sum + stat.count, 0);
    const resendSent = getStatusCount(resendStats, 'sent');
    const resendFailed = getStatusCount(resendStats, 'failed');
    const resendPending = getStatusCount(resendStats, 'pending');
    return {
      total,
      sent,
      failed,
      pending,
      byProvider: {
        zepto: { total: zeptoTotal, sent: zeptoSent, failed: zeptoFailed, pending: zeptoPending },
        resend: { total: resendTotal, sent: resendSent, failed: resendFailed, pending: resendPending }
      }
    };
  }
}
export default EmailService;