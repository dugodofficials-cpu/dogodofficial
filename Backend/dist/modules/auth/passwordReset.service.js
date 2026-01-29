"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = require("crypto");
const HttpException_1 = require("../../exceptions/HttpException");
const util_1 = require("../../utils/util");
const users_model_1 = tslib_1.__importDefault(require("../../modules/users/users.model"));
const email_service_1 = tslib_1.__importDefault(require("../../modules/email/email.service"));
const logger_1 = require("../../utils/logger");
const bcrypt_1 = require("bcrypt");
class PasswordResetService {
    constructor() {
        this.emailService = new email_service_1.default();
        this.users = users_model_1.default;
    }
    generateResetToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    getResetExpiry() {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        return expiry;
    }
    async sendPasswordResetEmail(email) {
        if ((0, util_1.isEmpty)(email)) {
            throw new HttpException_1.HttpException(400, 'Email is required');
        }
        try {
            const user = await this.users.findOne({ email });
            if (!user) {
                logger_1.logger.info(`Password reset requested for non-existent email: ${email}`);
                return;
            }
            const resetToken = this.generateResetToken();
            const resetExpiry = this.getResetExpiry();
            await this.users.findByIdAndUpdate(user._id, {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpiry,
            });
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
            const emailData = {
                to: [email],
                subject: 'Reset Your Password - Dugod',
                templateName: 'password-reset',
                variables: {
                    firstName: user.firstName || 'User',
                    resetUrl,
                    expiryHours: 1,
                },
            };
            await this.emailService.sendTemplateEmail(emailData);
            logger_1.logger.info(`Password reset email sent to ${email} for user ${user._id}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
            throw new HttpException_1.HttpException(500, 'Failed to send password reset email');
        }
    }
    async resetPassword(token, newPassword) {
        if ((0, util_1.isEmpty)(token) || (0, util_1.isEmpty)(newPassword)) {
            throw new HttpException_1.HttpException(400, 'Reset token and new password are required');
        }
        try {
            const user = await this.users.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() },
            }).select('+passwordResetToken +passwordResetExpires');
            if (!user) {
                throw new HttpException_1.HttpException(400, 'Invalid or expired reset token');
            }
            const hashedPassword = await (0, bcrypt_1.hash)(newPassword, 10);
            await this.users.findByIdAndUpdate(user._id, {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            });
            logger_1.logger.info(`Password reset successfully for user ${user._id}`);
            return {
                success: true,
                message: 'Password reset successful. Please login with your new password.'
            };
        }
        catch (error) {
            if (error instanceof HttpException_1.HttpException) {
                throw error;
            }
            logger_1.logger.error(`Password reset failed: ${error.message}`);
            throw new HttpException_1.HttpException(500, 'Password reset failed');
        }
    }
    async verifyResetToken(token) {
        if ((0, util_1.isEmpty)(token)) {
            throw new HttpException_1.HttpException(400, 'Reset token is required');
        }
        try {
            const user = await this.users.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() },
            });
            if (!user) {
                return {
                    valid: false,
                    message: 'Invalid or expired reset token'
                };
            }
            return {
                valid: true,
                message: 'Reset token is valid'
            };
        }
        catch (error) {
            logger_1.logger.error(`Token verification failed: ${error.message}`);
            throw new HttpException_1.HttpException(500, 'Token verification failed');
        }
    }
}
exports.default = PasswordResetService;
//# sourceMappingURL=passwordReset.service.js.map