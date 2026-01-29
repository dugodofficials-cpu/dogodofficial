"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsonwebtoken_1 = require("jsonwebtoken");
const _config_1 = require("../config");
const HttpException_1 = require("../exceptions/HttpException");
const users_model_1 = tslib_1.__importDefault(require("../modules/users/users.model"));
const session_service_1 = tslib_1.__importDefault(require("../modules/auth/session.service"));
const sessionService = new session_service_1.default();
const authMiddleware = async (req, res, next) => {
    try {
        const Authorization = req.cookies['dugo-auth-token'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
        if (Authorization) {
            const session = await sessionService.findSessionByToken(Authorization);
            if (!session) {
                next(new HttpException_1.HttpException(401, 'Session expired or invalid. Please login again.'));
                return;
            }
            const secretKey = _config_1.SECRET_KEY;
            const verificationResponse = (await (0, jsonwebtoken_1.verify)(Authorization, secretKey));
            const userId = verificationResponse._id;
            const findUser = await users_model_1.default.findById(userId);
            if (!(findUser === null || findUser === void 0 ? void 0 : findUser.isEmailVerified)) {
                throw new HttpException_1.HttpException(401, 'Email verification required. Please check your inbox and verify your email address.');
            }
            if (findUser) {
                await sessionService.updateLastActivity(Authorization);
                req.user = findUser;
                next();
            }
            else {
                next(new HttpException_1.HttpException(401, 'Invalid authentication token'));
            }
        }
        else {
            next(new HttpException_1.HttpException(401, 'Authentication token missing'));
        }
    }
    catch (error) {
        next(new HttpException_1.HttpException(401, 'Invalid authentication token'));
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map