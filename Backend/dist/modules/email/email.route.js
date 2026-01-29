"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailRoute = void 0;
const tslib_1 = require("tslib");
const express_1 = require("express");
const email_controller_1 = require("./email.controller");
const email_dto_1 = require("./email.dto");
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const permission_middleware_1 = require("../../middlewares/permission.middleware");
const roles_interface_1 = require("../roles/roles.interface");
class EmailRoute {
    constructor() {
        this.path = '/email';
        this.router = (0, express_1.Router)();
        this.email = new email_controller_1.EmailController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/send`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.SEND_EMAIL), (0, validation_middleware_1.default)(email_dto_1.SendEmailDto), this.email.sendEmail);
        this.router.post(`${this.path}/send-template`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.SEND_EMAIL), (0, validation_middleware_1.default)(email_dto_1.SendTemplateEmailDto), this.email.sendTemplateEmail);
        this.router.post(`${this.path}/templates`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.SEND_EMAIL), (0, validation_middleware_1.default)(email_dto_1.CreateTemplateDto), this.email.createTemplate);
        this.router.get(`${this.path}/templates`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_EMAIL), (0, validation_middleware_1.default)(email_dto_1.GetTemplatesQueryDto), this.email.getTemplates);
        this.router.get(`${this.path}/templates/:id`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_EMAIL), this.email.getTemplateById);
        this.router.put(`${this.path}/templates/:id`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPDATE_EMAIL), (0, validation_middleware_1.default)(email_dto_1.UpdateTemplateDto), this.email.updateTemplate);
        this.router.delete(`${this.path}/templates/:id`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.DELETE_EMAIL), this.email.deleteTemplate);
        this.router.get(`${this.path}/logs`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_EMAIL), (0, validation_middleware_1.default)(email_dto_1.GetEmailLogsQueryDto), this.email.getEmailLogs);
        this.router.get(`${this.path}/logs/:id`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_EMAIL), this.email.getEmailLogById);
        this.router.post(`${this.path}/logs/:id/resend`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.SEND_EMAIL), this.email.resendEmail);
    }
}
exports.EmailRoute = EmailRoute;
//# sourceMappingURL=email.route.js.map