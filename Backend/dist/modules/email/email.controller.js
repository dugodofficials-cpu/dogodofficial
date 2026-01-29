"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const tslib_1 = require("tslib");
const email_service_1 = tslib_1.__importDefault(require("./email.service"));
class EmailController {
    constructor() {
        this.email = new email_service_1.default();
        this.sendEmail = async (req, res, next) => {
            try {
                const emailData = req.body;
                const emailLog = await this.email.sendEmail(emailData);
                res.status(200).json({
                    data: emailLog,
                    message: 'Email sent successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.sendTemplateEmail = async (req, res, next) => {
            try {
                const templateData = req.body;
                const emailLog = await this.email.sendTemplateEmail(templateData);
                res.status(200).json({
                    data: emailLog,
                    message: 'Template email sent successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.createTemplate = async (req, res, next) => {
            try {
                const templateData = req.body;
                const template = await this.email.createTemplate(templateData);
                res.status(201).json({
                    data: template,
                    message: 'Template created successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getTemplates = async (req, res, next) => {
            try {
                const queryData = req.query;
                const queryParams = {
                    filters: {
                        name: queryData.name,
                        isActive: queryData.isActive,
                        search: queryData.search,
                    },
                    sort: {
                        field: queryData.sortBy || 'createdAt',
                        order: queryData.sortOrder || 'desc',
                    },
                    pagination: {
                        page: queryData.page || 1,
                        limit: queryData.limit || 10,
                    },
                };
                const result = await this.email.getTemplates(queryParams);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTemplateById = async (req, res, next) => {
            try {
                const templateId = req.params.id;
                const template = await this.email.getTemplateById(templateId);
                res.status(200).json({
                    data: template,
                    message: 'Template retrieved successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTemplate = async (req, res, next) => {
            try {
                const templateId = req.params.id;
                const templateData = req.body;
                const template = await this.email.updateTemplate(templateId, templateData);
                res.status(200).json({
                    data: template,
                    message: 'Template updated successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteTemplate = async (req, res, next) => {
            try {
                const templateId = req.params.id;
                const template = await this.email.deleteTemplate(templateId);
                res.status(200).json({
                    data: template,
                    message: 'Template deleted successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getEmailLogs = async (req, res, next) => {
            try {
                const queryData = req.query;
                const queryParams = {
                    filters: {
                        status: queryData.status,
                        templateName: queryData.templateName,
                        to: queryData.to,
                        dateFrom: queryData.dateFrom ? new Date(queryData.dateFrom) : undefined,
                        dateTo: queryData.dateTo ? new Date(queryData.dateTo) : undefined,
                        search: queryData.search,
                    },
                    sort: {
                        field: queryData.sortBy || 'createdAt',
                        order: queryData.sortOrder || 'desc',
                    },
                    pagination: {
                        page: queryData.page || 1,
                        limit: queryData.limit || 10,
                    },
                };
                const result = await this.email.getEmailLogs(queryParams);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getEmailLogById = async (req, res, next) => {
            try {
                const logId = req.params.id;
                const emailLog = await this.email.getEmailLogById(logId);
                res.status(200).json({
                    data: emailLog,
                    message: 'Email log retrieved successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.resendEmail = async (req, res, next) => {
            try {
                const logId = req.params.id;
                const emailLog = await this.email.resendEmail(logId);
                res.status(200).json({
                    data: emailLog,
                    message: 'Email resent successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.EmailController = EmailController;
//# sourceMappingURL=email.controller.js.map