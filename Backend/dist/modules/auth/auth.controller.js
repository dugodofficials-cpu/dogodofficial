"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const auth_service_1 = tslib_1.__importDefault(require("../../modules/auth/auth.service"));
const roles_service_1 = tslib_1.__importDefault(require("../roles/roles.service"));
const HttpException_1 = require("../../exceptions/HttpException");
const session_service_1 = tslib_1.__importDefault(require("./session.service"));
class AuthController {
    constructor() {
        this.authService = new auth_service_1.default();
        this.roleService = new roles_service_1.default();
        this.sessionService = new session_service_1.default();
        this.signUp = async (req, res, next) => {
            try {
                const userData = req.body;
                const { message } = await this.authService.signup(userData);
                res.status(201).json({
                    message: message || 'Signup successful',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.signUpGoogle = async (req, res, next) => {
            try {
                const userData = req.body;
                const { user, token, cookie, message } = await this.authService.signupGoogle(userData);
                res.setHeader('Set-Cookie', [cookie]);
                res.status(201).json({
                    data: Object.assign(Object.assign({}, user), { password: undefined, token }),
                    message: message || 'Google authentication successful',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.logIn = async (req, res, next) => {
            try {
                const userData = req.body;
                const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                const userAgent = req.headers['user-agent'];
                const { token, findUser, cookie } = await this.authService.login(userData, ipAddress, userAgent);
                res.setHeader('Set-Cookie', [cookie]);
                res.status(200).json({
                    data: Object.assign(Object.assign({}, findUser.toObject()), { password: undefined, token }),
                    message: 'login successful',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.logInAdmin = async (req, res, next) => {
            try {
                const userData = req.body;
                const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                const userAgent = req.headers['user-agent'];
                const { token, findUser, cookie } = await this.authService.login(userData, ipAddress, userAgent);
                if (!findUser.userRoles || !findUser.userRoles.length) {
                    throw new HttpException_1.HttpException(403, 'Access denied. Insufficient permissions.');
                }
                res.setHeader('Set-Cookie', [cookie]);
                res.status(200).json({
                    data: Object.assign(Object.assign({}, findUser.toObject()), { password: undefined, token }),
                    message: 'login successful',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.logOut = async (req, res, next) => {
            try {
                const userData = req.user;
                const token = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
                const logOutUserData = await this.authService.logout(userData, token);
                res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
                res.status(200).json({ data: logOutUserData, message: 'logout successful' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMe = async (req, res, next) => {
            try {
                const userData = req.user;
                const user = await this.authService.findUserById(userData._id);
                res.status(200).json({ data: user, message: 'get user profile' });
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyEmail = async (req, res, next) => {
            try {
                const { token } = req.params;
                const result = await this.authService.verifyEmail(token);
                if (result.success && result.token && result.cookie) {
                    res.setHeader('Set-Cookie', [result.cookie]);
                    res.status(200).json({
                        data: {
                            success: result.success,
                            message: result.message,
                            user: result.user,
                            token: result.token
                        },
                        message: result.message,
                    });
                }
                else {
                    res.status(200).json({
                        data: result,
                        message: result.message,
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.resendVerificationEmail = async (req, res, next) => {
            try {
                const { email } = req.body;
                const result = await this.authService.resendVerificationEmail(email);
                res.status(200).json({
                    data: result,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.checkEmailVerificationStatus = async (req, res, next) => {
            try {
                const { email } = req.query;
                if (!email || typeof email !== 'string') {
                    throw new Error('Email query parameter is required');
                }
                const result = await this.authService.checkEmailVerificationStatus(email);
                res.status(200).json({
                    data: result,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.forgotPassword = async (req, res, next) => {
            try {
                const { email } = req.body;
                const result = await this.authService.forgotPassword(email);
                res.status(200).json({
                    data: result,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.resetPassword = async (req, res, next) => {
            try {
                const { token, password } = req.body;
                const result = await this.authService.resetPassword(token, password);
                res.status(200).json({
                    data: result,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyResetToken = async (req, res, next) => {
            try {
                const { token } = req.params;
                const result = await this.authService.verifyResetToken(token);
                res.status(200).json({
                    data: result,
                    message: result.message,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMySessions = async (req, res, next) => {
            try {
                const userData = req.user;
                const sessions = await this.sessionService.findUserSessions(userData._id);
                res.status(200).json({
                    data: sessions,
                    message: 'Sessions retrieved successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.revokeSession = async (req, res, next) => {
            try {
                const userData = req.user;
                const { sessionId } = req.params;
                await this.sessionService.revokeSessionById(sessionId, userData._id);
                res.status(200).json({
                    message: 'Session revoked successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.revokeAllOtherSessions = async (req, res, next) => {
            try {
                const userData = req.user;
                const currentToken = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
                await this.sessionService.revokeAllUserSessions(userData._id, currentToken);
                res.status(200).json({
                    message: 'All other sessions revoked successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map