"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const zeptomail_1 = require("zeptomail");
const resend_1 = require("resend");
const HttpException_1 = require("../../exceptions/HttpException");
const util_1 = require("../../utils/util");
const email_model_1 = tslib_1.__importDefault(require("./email.model"));
const logger_1 = require("../../utils/logger");
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
class EmailService {
    constructor() {
        var _a, _b, _c;
        this.zeptoClient = new zeptomail_1.SendMailClient({
            url: ((_a = appConfig === null || appConfig === void 0 ? void 0 : appConfig.zepto) === null || _a === void 0 ? void 0 : _a.url) || 'https://api.zeptomail.com',
            token: ((_b = appConfig === null || appConfig === void 0 ? void 0 : appConfig.zepto) === null || _b === void 0 ? void 0 : _b.apiToken) || '',
        });
        this.resendClient = ((_c = appConfig === null || appConfig === void 0 ? void 0 : appConfig.resend) === null || _c === void 0 ? void 0 : _c.apiKey) ? new resend_1.Resend(appConfig.resend.apiKey) : null;
        this.initializeDefaultTemplates();
    }
    async initializeDefaultTemplates() {
        try {
            await this.createDefaultVerificationTemplate();
            await this.createDefaultPasswordResetTemplate();
            logger_1.logger.info('Default email templates initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize default email templates:', error.message);
        }
    }
    determineEmailProvider() {
        var _a, _b, _c, _d;
        const zeptoConfigured = ((_a = appConfig === null || appConfig === void 0 ? void 0 : appConfig.zepto) === null || _a === void 0 ? void 0 : _a.apiToken) && ((_b = appConfig === null || appConfig === void 0 ? void 0 : appConfig.zepto) === null || _b === void 0 ? void 0 : _b.domain);
        const resendConfigured = ((_c = appConfig === null || appConfig === void 0 ? void 0 : appConfig.resend) === null || _c === void 0 ? void 0 : _c.apiKey) && ((_d = appConfig === null || appConfig === void 0 ? void 0 : appConfig.resend) === null || _d === void 0 ? void 0 : _d.domain);
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
    async sendEmail(emailData) {
        if ((0, util_1.isEmpty)(emailData))
            throw new HttpException_1.HttpException(400, 'Email data is empty');
        const provider = this.determineEmailProvider();
        const emailLog = await email_model_1.default.EmailLog.create({
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
            }
            else if (provider === 'resend') {
                return await this.sendViaResend(emailData, emailLog);
            }
            else {
                throw new Error(`Unsupported email provider: ${provider}`);
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to send email via ${provider}: ${error.message}`);
            const updatedLog = await email_model_1.default.EmailLog.findByIdAndUpdate(emailLog._id, {
                status: 'failed',
                errorMessage: error.message || 'Unknown error occurred',
            }, { new: true });
            throw new HttpException_1.HttpException(500, `Failed to send email via ${provider}: ${error.message || 'Unknown error occurred'}`);
        }
    }
    async sendEmailWithProvider(emailData, provider) {
        var _a, _b, _c, _d;
        if ((0, util_1.isEmpty)(emailData))
            throw new HttpException_1.HttpException(400, 'Email data is empty');
        if (provider === 'zepto' && (!((_a = appConfig === null || appConfig === void 0 ? void 0 : appConfig.zepto) === null || _a === void 0 ? void 0 : _a.apiToken) || !((_b = appConfig === null || appConfig === void 0 ? void 0 : appConfig.zepto) === null || _b === void 0 ? void 0 : _b.domain))) {
            throw new HttpException_1.HttpException(400, 'ZeptoMail configuration is incomplete. Please check ZEPTO_API_TOKEN and ZEPTO_DOMAIN environment variables.');
        }
        if (provider === 'resend' && (!((_c = appConfig === null || appConfig === void 0 ? void 0 : appConfig.resend) === null || _c === void 0 ? void 0 : _c.apiKey) || !((_d = appConfig === null || appConfig === void 0 ? void 0 : appConfig.resend) === null || _d === void 0 ? void 0 : _d.domain))) {
            throw new HttpException_1.HttpException(400, 'Resend configuration is incomplete. Please check RESEND_API_KEY and RESEND_DOMAIN environment variables.');
        }
        const emailLog = await email_model_1.default.EmailLog.create({
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
            }
            else if (provider === 'resend') {
                return await this.sendViaResend(emailData, emailLog);
            }
            else {
                throw new Error(`Unsupported email provider: ${provider}`);
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to send email via ${provider}: ${error.message}`);
            await email_model_1.default.EmailLog.findByIdAndUpdate(emailLog._id, {
                status: 'failed',
                errorMessage: error.message || 'Unknown error occurred',
            }, { new: true });
            throw new HttpException_1.HttpException(500, `Failed to send email via ${provider}: ${error.message || 'Unknown error occurred'}`);
        }
    }
    async sendViaZepto(emailData, emailLog) {
        var _a, _b, _c, _d;
        if (!((_a = appConfig === null || appConfig === void 0 ? void 0 : appConfig.zepto) === null || _a === void 0 ? void 0 : _a.apiToken) || !((_b = appConfig === null || appConfig === void 0 ? void 0 : appConfig.zepto) === null || _b === void 0 ? void 0 : _b.domain)) {
            throw new Error('ZeptoMail configuration is incomplete. Please check ZEPTO_API_TOKEN and ZEPTO_DOMAIN environment variables.');
        }
        const mailData = {
            from: {
                address: `noreply@${appConfig.zepto.domain}`,
                name: 'Dugod Service',
            },
            to: emailData.to.map(email => ({ email_address: { address: email } })),
            cc: ((_c = emailData.cc) === null || _c === void 0 ? void 0 : _c.map(email => ({ email_address: { address: email } }))) || [],
            bcc: ((_d = emailData.bcc) === null || _d === void 0 ? void 0 : _d.map(email => ({ email_address: { address: email } }))) || [],
            subject: emailData.subject,
            htmlbody: emailData.htmlContent,
            textbody: emailData.textContent,
        };
        logger_1.logger.info(`Attempting to send email via ZeptoMail: ${emailData.to} ${emailData.subject} ${appConfig.zepto.domain}`);
        const response = await this.zeptoClient.sendMail(mailData);
        logger_1.logger.info('Email sent successfully via ZeptoMail:', response.message_id);
        const updatedLog = await email_model_1.default.EmailLog.findByIdAndUpdate(emailLog._id, {
            status: 'sent',
            zeptoMessageId: response.message_id,
            sentAt: new Date(),
        }, { new: true });
        return updatedLog;
    }
    async sendViaResend(emailData, emailLog) {
        var _a, _b;
        if (!((_a = appConfig === null || appConfig === void 0 ? void 0 : appConfig.resend) === null || _a === void 0 ? void 0 : _a.apiKey) || !((_b = appConfig === null || appConfig === void 0 ? void 0 : appConfig.resend) === null || _b === void 0 ? void 0 : _b.domain)) {
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
        logger_1.logger.info(`Attempting to send email via Resend: ${emailData.to} ${emailData.subject} ${appConfig.resend.domain}`);
        const response = await this.resendClient.emails.send(mailData);
        logger_1.logger.info('Email sent successfully via Resend:', response.id);
        const updatedLog = await email_model_1.default.EmailLog.findByIdAndUpdate(emailLog._id, {
            status: 'sent',
            resendMessageId: response.id,
            sentAt: new Date(),
        }, { new: true });
        return updatedLog;
    }
    async sendTemplateEmail(templateData) {
        if ((0, util_1.isEmpty)(templateData))
            throw new HttpException_1.HttpException(400, 'Template data is empty');
        const template = await email_model_1.default.EmailTemplate.findOne({
            name: templateData.templateName,
            isActive: true,
        });
        if (!template) {
            throw new HttpException_1.HttpException(404, `Template '${templateData.templateName}' not found or inactive`);
        }
        const missingVariables = template.variables.filter(variable => !templateData.variables.hasOwnProperty(variable));
        if (missingVariables.length > 0) {
            throw new HttpException_1.HttpException(400, `Missing required variables: ${missingVariables.join(', ')}`);
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
    async createTemplate(templateData) {
        if ((0, util_1.isEmpty)(templateData))
            throw new HttpException_1.HttpException(400, 'Template data is empty');
        const existingTemplate = await email_model_1.default.EmailTemplate.findOne({ name: templateData.name });
        if (existingTemplate) {
            throw new HttpException_1.HttpException(409, `Template with name '${templateData.name}' already exists`);
        }
        const template = await email_model_1.default.EmailTemplate.create(templateData);
        return template;
    }
    async createDefaultVerificationTemplate() {
        const templateName = 'email-verification';
        const existingTemplate = await email_model_1.default.EmailTemplate.findOne({ name: templateName });
        if (existingTemplate) {
            return existingTemplate;
        }
        const templateData = {
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
    async createDefaultPasswordResetTemplate() {
        const templateName = 'password-reset';
        const existingTemplate = await email_model_1.default.EmailTemplate.findOne({ name: templateName });
        if (existingTemplate) {
            return existingTemplate;
        }
        const templateData = {
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
    async getTemplates(queryParams) {
        const { filters = {}, sort = { field: 'createdAt', order: 'desc' }, pagination = { page: 1, limit: 10 } } = queryParams;
        const filterObj = {};
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
        const sortObj = {};
        sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;
        const skip = (pagination.page - 1) * pagination.limit;
        const total = await email_model_1.default.EmailTemplate.countDocuments(filterObj);
        const templates = await email_model_1.default.EmailTemplate
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
    async getTemplateById(templateId) {
        if ((0, util_1.isEmpty)(templateId))
            throw new HttpException_1.HttpException(400, 'Template ID is empty');
        const template = await email_model_1.default.EmailTemplate.findById(templateId);
        if (!template)
            throw new HttpException_1.HttpException(404, 'Template not found');
        return template;
    }
    async updateTemplate(templateId, templateData) {
        if ((0, util_1.isEmpty)(templateId))
            throw new HttpException_1.HttpException(400, 'Template ID is empty');
        if ((0, util_1.isEmpty)(templateData))
            throw new HttpException_1.HttpException(400, 'Template data is empty');
        const existingTemplate = await email_model_1.default.EmailTemplate.findById(templateId);
        if (!existingTemplate)
            throw new HttpException_1.HttpException(404, 'Template not found');
        if (templateData.name && templateData.name !== existingTemplate.name) {
            const nameConflict = await email_model_1.default.EmailTemplate.findOne({ name: templateData.name });
            if (nameConflict) {
                throw new HttpException_1.HttpException(409, `Template with name '${templateData.name}' already exists`);
            }
        }
        const updatedTemplate = await email_model_1.default.EmailTemplate.findByIdAndUpdate(templateId, templateData, { new: true });
        return updatedTemplate;
    }
    async deleteTemplate(templateId) {
        if ((0, util_1.isEmpty)(templateId))
            throw new HttpException_1.HttpException(400, 'Template ID is empty');
        const template = await email_model_1.default.EmailTemplate.findByIdAndDelete(templateId);
        if (!template)
            throw new HttpException_1.HttpException(404, 'Template not found');
        return template;
    }
    async getEmailLogs(queryParams) {
        const { filters = {}, sort = { field: 'createdAt', order: 'desc' }, pagination = { page: 1, limit: 10 } } = queryParams;
        const filterObj = {};
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
        const sortObj = {};
        sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;
        const skip = (pagination.page - 1) * pagination.limit;
        const total = await email_model_1.default.EmailLog.countDocuments(filterObj);
        const emailLogs = await email_model_1.default.EmailLog
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
    async getEmailLogById(logId) {
        if ((0, util_1.isEmpty)(logId))
            throw new HttpException_1.HttpException(400, 'Log ID is empty');
        const emailLog = await email_model_1.default.EmailLog.findById(logId);
        if (!emailLog)
            throw new HttpException_1.HttpException(404, 'Email log not found');
        return emailLog;
    }
    async resendEmail(logId) {
        if ((0, util_1.isEmpty)(logId))
            throw new HttpException_1.HttpException(400, 'Log ID is empty');
        const emailLog = await email_model_1.default.EmailLog.findById(logId);
        if (!emailLog)
            throw new HttpException_1.HttpException(404, 'Email log not found');
        if (emailLog.status === 'sent') {
            throw new HttpException_1.HttpException(400, 'Email has already been sent successfully');
        }
        await email_model_1.default.EmailLog.findByIdAndUpdate(logId, { status: 'pending' });
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
    async getEmailLogsByProvider(provider, queryParams) {
        const filters = Object.assign(Object.assign({}, queryParams.filters), { provider });
        return this.getEmailLogs(Object.assign(Object.assign({}, queryParams), { filters }));
    }
    async getEmailStats() {
        const [totalStats, zeptoStats, resendStats] = await Promise.all([
            email_model_1.default.EmailLog.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),
            email_model_1.default.EmailLog.aggregate([
                { $match: { provider: 'zepto' } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),
            email_model_1.default.EmailLog.aggregate([
                { $match: { provider: 'resend' } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);
        const getStatusCount = (stats, status) => {
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
exports.default = EmailService;
//# sourceMappingURL=email.service.js.map