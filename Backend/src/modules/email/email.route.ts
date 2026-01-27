import { Router } from 'express';
import { EmailController } from './email.controller';
import { SendEmailDto, SendTemplateEmailDto, CreateTemplateDto, UpdateTemplateDto, GetEmailLogsQueryDto, GetTemplatesQueryDto } from './email.dto';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { hasPermission } from '@/middlewares/permission.middleware';
import { Permission } from '../roles/roles.interface';
export class EmailRoute {
  public path = '/email';
  public router = Router();
  public email = new EmailController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}/send`,
      authMiddleware,
      hasPermission(Permission.SEND_EMAIL),
      validationMiddleware(SendEmailDto),
      this.email.sendEmail
    );
    this.router.post(
      `${this.path}/send-template`,
      authMiddleware,
      hasPermission(Permission.SEND_EMAIL),
      validationMiddleware(SendTemplateEmailDto),
      this.email.sendTemplateEmail
    );
    this.router.post(
      `${this.path}/templates`,
      authMiddleware,
      hasPermission(Permission.SEND_EMAIL),
      validationMiddleware(CreateTemplateDto),
      this.email.createTemplate
    );
    this.router.get(
      `${this.path}/templates`,
      authMiddleware,
      hasPermission(Permission.READ_EMAIL),
      validationMiddleware(GetTemplatesQueryDto),
      this.email.getTemplates
    );
    this.router.get(
      `${this.path}/templates/:id`,
      authMiddleware,
      hasPermission(Permission.READ_EMAIL),
      this.email.getTemplateById
    );
    this.router.put(
      `${this.path}/templates/:id`,
      authMiddleware,
      hasPermission(Permission.UPDATE_EMAIL),
      validationMiddleware(UpdateTemplateDto),
      this.email.updateTemplate
    );
    this.router.delete(
      `${this.path}/templates/:id`,
      authMiddleware,
      hasPermission(Permission.DELETE_EMAIL),
      this.email.deleteTemplate
    );
    this.router.get(
      `${this.path}/logs`,
      authMiddleware,
      hasPermission(Permission.READ_EMAIL),
      validationMiddleware(GetEmailLogsQueryDto),
      this.email.getEmailLogs
    );
    this.router.get(
      `${this.path}/logs/:id`,
      authMiddleware,
      hasPermission(Permission.READ_EMAIL),
      this.email.getEmailLogById
    );
    this.router.post(
      `${this.path}/logs/:id/resend`,
      authMiddleware,
      hasPermission(Permission.SEND_EMAIL),
      this.email.resendEmail
    );
  }
}