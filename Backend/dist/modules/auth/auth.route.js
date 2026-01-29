"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const auth_controller_1 = tslib_1.__importDefault(require("../../modules/auth/auth.controller"));
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
const rateLimit_middleware_1 = require("../../middlewares/rateLimit.middleware");
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const express_1 = require("express");
const auth_dto_1 = require("./auth.dto");
const permission_middleware_1 = require("../../middlewares/permission.middleware");
const roles_interface_1 = require("../../modules/roles/roles.interface");
class AuthRoute {
    constructor() {
        this.path = '/auth';
        this.router = (0, express_1.Router)();
        this.authController = new auth_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/google`, rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.default)(auth_dto_1.SignUpGoogleDto, 'body'), this.authController.signUpGoogle);
        this.router.post(`${this.path}/signup`, rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.default)(auth_dto_1.SignUpDto, 'body'), this.authController.signUp);
        this.router.post(`${this.path}/signin`, rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.default)(auth_dto_1.SignUpDto, 'body'), this.authController.logIn);
        this.router.post(`${this.path}/signin/admin`, [rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.default)(auth_dto_1.SignUpDto, 'body'), (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.LOGIN)], this.authController.logInAdmin);
        this.router.post(`${this.path}/logout`, auth_middleware_1.default, this.authController.logOut);
        this.router.get(`${this.path}/me`, auth_middleware_1.default, this.authController.getMe);
        this.router.get(`${this.path}/verify-email/:token`, this.authController.verifyEmail);
        this.router.post(`${this.path}/resend-verification`, (0, validation_middleware_1.default)(auth_dto_1.ResendVerificationDto, 'body'), this.authController.resendVerificationEmail);
        this.router.get(`${this.path}/check-verification`, this.authController.checkEmailVerificationStatus);
        this.router.post(`${this.path}/forgot-password`, rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.default)(auth_dto_1.ForgotPasswordDto, 'body'), this.authController.forgotPassword);
        this.router.post(`${this.path}/reset-password`, rateLimit_middleware_1.authLimiter, (0, validation_middleware_1.default)(auth_dto_1.ResetPasswordDto, 'body'), this.authController.resetPassword);
        this.router.get(`${this.path}/verify-reset-token/:token`, this.authController.verifyResetToken);
    }
}
exports.default = AuthRoute;
//# sourceMappingURL=auth.route.js.map