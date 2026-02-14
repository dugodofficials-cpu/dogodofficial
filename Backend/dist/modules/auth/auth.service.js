"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const users_model_1 = tslib_1.__importDefault(require("../../modules/users/users.model"));
const _config_1 = require("../../config");
const HttpException_1 = require("../../exceptions/HttpException");
const util_1 = require("../../utils/util");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const google_auth_library_1 = require("google-auth-library");
const logger_1 = require("../../utils/logger");
const emailVerification_service_1 = tslib_1.__importDefault(require("./emailVerification.service"));
const passwordReset_service_1 = tslib_1.__importDefault(require("./passwordReset.service"));
const session_service_1 = tslib_1.__importDefault(require("./session.service"));
class AuthService {
    constructor() {
        this.users = users_model_1.default;
        this.users = users_model_1.default;
        this.googleClient = new google_auth_library_1.OAuth2Client(_config_1.GOOGLE_CLIENT_ID, _config_1.GOOGLE_CLIENT_SECRET);
        this.emailVerificationService = new emailVerification_service_1.default();
        this.passwordResetService = new passwordReset_service_1.default();
        this.sessionService = new session_service_1.default();
    }
    async signup(userData) {
        if ((0, util_1.isEmpty)(userData))
            throw new HttpException_1.HttpException(400, 'userData is empty');
        const findUser = await this.users.findOne({ email: userData.email });
        if (findUser)
            throw new HttpException_1.HttpException(409, `This email ${userData.email} already exists`);
        const hashedPassword = await (0, bcrypt_1.hash)(userData.password, 10);
        const createUserData = await this.users.create(Object.assign(Object.assign({}, userData), { password: hashedPassword, isEmailVerified: false, status: 'pending' }));
        try {
            await this.emailVerificationService.sendVerificationEmail(createUserData._id.toString(), createUserData.email, createUserData.firstName);
        }
        catch (error) {
            logger_1.logger.error(`Failed to send verification email during signup: ${error.message}`);
        }
        return {
            message: 'Account created successfully. Please check your email to verify your account.'
        };
    }
    async login(userData, ipAddress, userAgent) {
        if ((0, util_1.isEmpty)(userData))
            throw new HttpException_1.HttpException(400, 'userData is empty');
        const findUser = await this.users.findOne({ email: userData.email.toLowerCase() }).populate('userRoles').select('+password');
        if (!findUser)
            throw new HttpException_1.HttpException(401, `Invalid email or password`);
        const isPasswordMatching = await (0, bcrypt_1.compare)(userData.password, findUser.password);
        if (!isPasswordMatching)
            throw new HttpException_1.HttpException(401, 'Invalid email or password');
        if (!findUser.isEmailVerified) {
            throw new HttpException_1.HttpException(403, 'Please verify your email address before logging in. Check your inbox for a verification email.');
        }
        if (findUser.status !== 'active') {
            throw new HttpException_1.HttpException(403, 'Your account is not active. Please contact support for assistance.');
        }
        const tokenData = this.createToken(findUser);
        const cookie = this.createCookie(tokenData);
        try {
            await this.sessionService.createSession(findUser.id, tokenData.token, ipAddress, userAgent, tokenData.expiresIn);
        }
        catch (error) {
            logger_1.logger.error(`Failed to create session for user ${findUser._id}: ${error.message}`);
        }
        return { token: tokenData.token, findUser, cookie };
    }
    async logout(userData, token) {
        if ((0, util_1.isEmpty)(userData))
            throw new HttpException_1.HttpException(400, 'userData is empty');
        const findUser = await this.users.findOne({ email: userData.email });
        if (!findUser)
            throw new HttpException_1.HttpException(409, `This email ${userData.email} was not found`);
        if (token) {
            try {
                await this.sessionService.revokeSession(token);
                logger_1.logger.info(`Session revoked for user ${findUser._id}`);
            }
            catch (error) {
                logger_1.logger.error(`Failed to revoke session for user ${findUser._id}: ${error.message}`);
            }
        }
        return findUser;
    }
    async findUserById(userId) {
        const findUser = await this.users.findById(userId);
        if (!findUser)
            throw new HttpException_1.HttpException(404, 'User not found');
        return findUser;
    }
    async verifyEmail(token) {
        const result = await this.emailVerificationService.verifyEmail(token);
        if (result.success && result.user) {
            await this.users.findByIdAndUpdate(result.user._id, {
                status: 'active'
            });
            logger_1.logger.info(`User ${result.user._id} activated after email verification`);
            const tokenData = this.createToken(result.user);
            const cookie = this.createCookie(tokenData);
            try {
                await this.sessionService.createSession(result.user.id, tokenData.token, undefined, undefined, tokenData.expiresIn);
            }
            catch (error) {
                logger_1.logger.error(`Failed to create session for user ${result.user._id}: ${error.message}`);
            }
            return {
                success: true,
                message: 'Email verified successfully! You are now logged in.',
                token: tokenData.token,
                cookie,
                user: Object.assign(Object.assign({}, result.user.toObject()), { status: 'active' })
            };
        }
        return result;
    }
    async resendVerificationEmail(email) {
        await this.emailVerificationService.resendVerificationEmail(email);
        return { message: 'Verification email sent successfully' };
    }
    async checkEmailVerificationStatus(email) {
        if ((0, util_1.isEmpty)(email))
            throw new HttpException_1.HttpException(400, 'Email is required');
        const user = await this.users.findOne({ email }).select('isEmailVerified status');
        if (!user) {
            throw new HttpException_1.HttpException(404, 'User not found');
        }
        return {
            isVerified: user.isEmailVerified || false,
            status: user.status || 'pending',
            message: user.isEmailVerified
                ? 'Email is verified and account is active'
                : 'Email verification required'
        };
    }
    async forgotPassword(email) {
        if ((0, util_1.isEmpty)(email))
            throw new HttpException_1.HttpException(400, 'Email is required');
        await this.passwordResetService.sendPasswordResetEmail(email);
        return { message: 'If an account with your email exists, a password reset link has been sent.' };
    }
    async resetPassword(token, newPassword) {
        if ((0, util_1.isEmpty)(token) || (0, util_1.isEmpty)(newPassword))
            throw new HttpException_1.HttpException(400, 'Token and new password are required');
        const result = await this.passwordResetService.resetPassword(token, newPassword);
        return { message: result.message };
    }
    async verifyResetToken(token) {
        if ((0, util_1.isEmpty)(token))
            throw new HttpException_1.HttpException(400, 'Token is required');
        return await this.passwordResetService.verifyResetToken(token);
    }
    createToken(user) {
        const dataStoredInToken = { _id: user._id.toString() };
        const secretKey = _config_1.SECRET_KEY;
        const expiresIn = 180 * 24 * 60 * 60;
        return { expiresIn, token: (0, jsonwebtoken_1.sign)(dataStoredInToken, secretKey, { expiresIn }) };
    }
    createCookie(tokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
    }
    async signupGoogle(userData) {
        if ((0, util_1.isEmpty)(userData))
            throw new HttpException_1.HttpException(400, 'userData is empty');
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: userData.token,
                audience: _config_1.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email)
                throw new HttpException_1.HttpException(400, 'Invalid Google token');
            let user = await this.users.findOne({ email: payload.email });
            if (user) {
                if (!user.picture) {
                    user.picture = payload.picture;
                    await user.save();
                }
                const tokenData = this.createToken(user);
                const cookie = this.createCookie(tokenData);
                try {
                    await this.sessionService.createSession(user.id, tokenData.token, undefined, undefined, tokenData.expiresIn);
                }
                catch (error) {
                    logger_1.logger.error(`Failed to create session for user ${user._id}: ${error.message}`);
                }
                return { user, token: tokenData.token, cookie, message: 'Login successful' };
            }
            const createUserData = await this.users.create({
                email: payload.email,
                firstName: payload.given_name || '',
                lastName: payload.family_name || '',
                picture: payload.picture || '',
                password: payload.sub,
                phone: '',
                status: 'active',
                isEmailVerified: true,
                address: {
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: ''
                },
            });
            const tokenData = this.createToken(createUserData);
            const cookie = this.createCookie(tokenData);
            try {
                await this.sessionService.createSession(createUserData._id, tokenData.token, undefined, undefined, tokenData.expiresIn);
            }
            catch (error) {
                logger_1.logger.error(`Failed to create session for user ${createUserData._id}: ${error.message}`);
            }
            return {
                user: createUserData,
                token: tokenData.token,
                cookie,
                message: 'Account created successfully. Please check your email to verify your account.'
            };
        }
        catch (error) {
            logger_1.logger.error(error);
            throw new HttpException_1.HttpException(401, 'Invalid Google token');
        }
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map