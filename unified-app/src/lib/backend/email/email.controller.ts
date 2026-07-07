import { NextFunction, Request, Response } from 'express';
import EmailService from './email.service';
import { SendEmailDto, SendTemplateEmailDto, CreateTemplateDto, UpdateTemplateDto, GetEmailLogsQueryDto, GetTemplatesQueryDto } from './email.dto';
import { EmailQueryParams } from './email.interface';
export class EmailController {
  public email = new EmailService();
  public sendEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emailData: SendEmailDto = req.body;
      const emailLog = await this.email.sendEmail(emailData);
      res.status(200).json({
        data: emailLog,
        message: 'Email sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  public sendTemplateEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templateData: SendTemplateEmailDto = req.body;
      const emailLog = await this.email.sendTemplateEmail(templateData);
      res.status(200).json({
        data: emailLog,
        message: 'Template email sent successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  public createTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templateData: CreateTemplateDto = req.body;
      const template = await this.email.createTemplate(templateData);
      res.status(201).json({
        data: template,
        message: 'Template created successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  public getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryData: GetTemplatesQueryDto = req.query as any;
      const queryParams: EmailQueryParams = {
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
    } catch (error) {
      next(error);
    }
  };
  public getTemplateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templateId = req.params.id;
      const template = await this.email.getTemplateById(templateId);
      res.status(200).json({
        data: template,
        message: 'Template retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  public updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templateId = req.params.id;
      const templateData: UpdateTemplateDto = req.body;
      const template = await this.email.updateTemplate(templateId, templateData);
      res.status(200).json({
        data: template,
        message: 'Template updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  public deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templateId = req.params.id;
      const template = await this.email.deleteTemplate(templateId);
      res.status(200).json({
        data: template,
        message: 'Template deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  public getEmailLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryData: GetEmailLogsQueryDto = req.query as any;
      const queryParams: EmailQueryParams = {
        filters: {
          status: queryData.status as 'sent' | 'failed' | 'pending',
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
    } catch (error) {
      next(error);
    }
  };
  public getEmailLogById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logId = req.params.id;
      const emailLog = await this.email.getEmailLogById(logId);
      res.status(200).json({
        data: emailLog,
        message: 'Email log retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };
  public resendEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logId = req.params.id;
      const emailLog = await this.email.resendEmail(logId);
      res.status(200).json({
        data: emailLog,
        message: 'Email resent successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}