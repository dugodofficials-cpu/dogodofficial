"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = require("crypto");
const HttpException_1 = require("../../exceptions/HttpException");
const util_1 = require("../../utils/util");
const users_model_1 = tslib_1.__importDefault(require("../../modules/users/users.model"));
const email_service_1 = tslib_1.__importDefault(require("../../modules/email/email.service"));
const logger_1 = require("../../utils/logger");
class EmailVerificationService {
    constructor() {
        this.emailService = new email_service_1.default();
        this.users = users_model_1.default;
    }
    generateVerificationToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    getVerificationExpiry() {
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        return expiry;
    }
    async sendVerificationEmail(userId, userEmail, firstName) {
        if ((0, util_1.isEmpty)(userId) || (0, util_1.isEmpty)(userEmail)) {
            throw new HttpException_1.HttpException(400, 'User ID and email are required');
        }
        try {
            const verificationToken = this.generateVerificationToken();
            const verificationExpiry = this.getVerificationExpiry();
            await this.users.findByIdAndUpdate(userId, {
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpiry,
            });
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;
            const emailData = {
                to: [userEmail],
                subject: 'Verify Your Email Address - Dugod',
                templateName: 'email-verification',
                variables: {
                    firstName: firstName || 'User',
                    verificationUrl,
                    expiryHours: 24,
                },
            };
            await this.emailService.sendTemplateEmail(emailData);
            logger_1.logger.info(`Verification email sent to ${userEmail} for user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to send verification email to ${userEmail}: ${error.message}`);
            throw new HttpException_1.HttpException(500, 'Failed to send verification email');
        }
    }
    async verifyEmail(token) {
        if ((0, util_1.isEmpty)(token)) {
            throw new HttpException_1.HttpException(400, 'Verification token is required');
        }
        try {
            const user = await this.users.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: new Date() },
            }).select('+emailVerificationToken +emailVerificationExpires');
            if (!user) {
                throw new HttpException_1.HttpException(400, 'Invalid or expired verification token');
            }
            await this.users.findByIdAndUpdate(user._id, {
                isEmailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null,
            });
            logger_1.logger.info(`Email verified for user ${user._id}`);
            const verifiedUser = await this.users.findById(user._id).select('-password -emailVerificationToken -emailVerificationExpires');
            return {
                success: true,
                message: 'Email verified successfully',
                user: verifiedUser
            };
        }
        catch (error) {
            if (error instanceof HttpException_1.HttpException) {
                throw error;
            }
            logger_1.logger.error(`Email verification failed: ${error.message}`);
            throw new HttpException_1.HttpException(500, 'Email verification failed');
        }
    }
    async resendVerificationEmail(email) {
        if ((0, util_1.isEmpty)(email)) {
            throw new HttpException_1.HttpException(400, 'Email is required');
        }
        try {
            const user = await this.users.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires');
            if (!user) {
                throw new HttpException_1.HttpException(404, 'User not found');
            }
            if (user.isEmailVerified) {
                throw new HttpException_1.HttpException(400, 'Email is already verified');
            }
            if (user.emailVerificationExpires && user.emailVerificationExpires > new Date(Date.now() - 5 * 60 * 1000)) {
                throw new HttpException_1.HttpException(400, 'Please wait 5 minutes before requesting another verification email');
            }
            await this.sendVerificationEmail(user._id.toString(), user.email, user.firstName);
            logger_1.logger.info(`Verification email resent to ${email}`);
        }
        catch (error) {
            if (error instanceof HttpException_1.HttpException) {
                throw error;
            }
            logger_1.logger.error(`Failed to resend verification email to ${email}: ${error.message}`);
            throw new HttpException_1.HttpException(500, 'Failed to resend verification email');
        }
    }
}
exports.default = EmailVerificationService;
//# sourceMappingURL=emailVerification.service.js.map