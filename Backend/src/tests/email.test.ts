import mongoose from 'mongoose';
import request from 'supertest';
import App from '@/app';
import EmailRoute from '@/modules/email/email.route';
beforeAll(async () => {
  jest.setTimeout(10000);
});
afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});
describe('Testing Email Service', () => {
  describe('[POST] /email/send', () => {
    it('should send a direct email', async () => {
      const emailRoute = new EmailRoute();
      const emailService = emailRoute.email.email;
      emailService.sendEmail = jest.fn().mockReturnValue({
        _id: 'test-email-log-id',
        to: ['test@example.com'],
        subject: 'Test Email',
        htmlContent: '<p>Test email content</p>',
        status: 'sent',
        zeptoMessageId: 'test-message-id',
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (mongoose as any).connect = jest.fn();
      const app = new App([emailRoute]);
      const emailData = {
        to: ['test@example.com'],
        subject: 'Test Email',
        htmlContent: '<p>Test email content</p>',
      };
      return request(app.getServer())
        .post(`${emailRoute.path}/send`)
        .send(emailData)
        .expect(200);
    });
  });
  describe('[POST] /email/send-template', () => {
    it('should send a template email', async () => {
      const emailRoute = new EmailRoute();
      const emailService = emailRoute.email.email;
      emailService.sendTemplateEmail = jest.fn().mockReturnValue({
        _id: 'test-template-email-log-id',
        to: ['test@example.com'],
        subject: 'Welcome to Dugod',
        htmlContent: '<p>Welcome {{name}}!</p>',
        templateName: 'welcome',
        variables: { name: 'John' },
        status: 'sent',
        zeptoMessageId: 'test-template-message-id',
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (mongoose as any).connect = jest.fn();
      const app = new App([emailRoute]);
      const templateData = {
        templateName: 'welcome',
        to: ['test@example.com'],
        variables: { name: 'John' },
      };
      return request(app.getServer())
        .post(`${emailRoute.path}/send-template`)
        .send(templateData)
        .expect(200);
    });
  });
  describe('[POST] /email/templates', () => {
    it('should create a new email template', async () => {
      const emailRoute = new EmailRoute();
      const emailService = emailRoute.email.email;
      emailService.createTemplate = jest.fn().mockReturnValue({
        _id: 'test-template-id',
        name: 'welcome',
        subject: 'Welcome to Dugod',
        htmlContent: '<p>Welcome {{name}}!</p>',
        variables: ['name'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (mongoose as any).connect = jest.fn();
      const app = new App([emailRoute]);
      const templateData = {
        name: 'welcome',
        subject: 'Welcome to Dugod',
        htmlContent: '<p>Welcome {{name}}!</p>',
        variables: ['name'],
      };
      return request(app.getServer())
        .post(`${emailRoute.path}/templates`)
        .send(templateData)
        .expect(201);
    });
  });
  describe('[GET] /email/templates', () => {
    it('should get all templates with pagination', async () => {
      const emailRoute = new EmailRoute();
      const emailService = emailRoute.email.email;
      emailService.getTemplates = jest.fn().mockReturnValue({
        data: [
          {
            _id: 'test-template-id',
            name: 'welcome',
            subject: 'Welcome to Dugod',
            htmlContent: '<p>Welcome {{name}}!</p>',
            variables: ['name'],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        message: 'success',
      });
      (mongoose as any).connect = jest.fn();
      const app = new App([emailRoute]);
      return request(app.getServer())
        .get(`${emailRoute.path}/templates?page=1&limit=10`)
        .expect(200);
    });
  });
  describe('[GET] /email/logs', () => {
    it('should get email logs with pagination', async () => {
      const emailRoute = new EmailRoute();
      const emailService = emailRoute.email.email;
      emailService.getEmailLogs = jest.fn().mockReturnValue({
        data: [
          {
            _id: 'test-log-id',
            to: ['test@example.com'],
            subject: 'Test Email',
            htmlContent: '<p>Test email content</p>',
            status: 'sent',
            zeptoMessageId: 'test-message-id',
            sentAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        message: 'success',
      });
      (mongoose as any).connect = jest.fn();
      const app = new App([emailRoute]);
      return request(app.getServer())
        .get(`${emailRoute.path}/logs?page=1&limit=10`)
        .expect(200);
    });
  });
});