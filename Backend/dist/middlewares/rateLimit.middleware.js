"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootPathLimiter = exports.securityLimiter = exports.authLimiter = exports.strictLimiter = exports.defaultLimiter = exports.rateLimiter = void 0;
const tslib_1 = require("tslib");
const express_rate_limit_1 = tslib_1.__importDefault(require("express-rate-limit"));
const jsonwebtoken_1 = require("jsonwebtoken");
const _config_1 = require("../config");
const rateLimiter = (windowMs = 15 * 60 * 1000, max = 10000, customMessage) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: customMessage || {
            status: 429,
            error: 'Too many requests from this user, please try again later.',
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            var _a, _b, _c;
            let userId;
            try {
                const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a['Authorization']) || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
                if (token) {
                    const decoded = (0, jsonwebtoken_1.verify)(token, _config_1.SECRET_KEY);
                    userId = (_c = (_b = decoded === null || decoded === void 0 ? void 0 : decoded._id) === null || _b === void 0 ? void 0 : _b.toString) === null || _c === void 0 ? void 0 : _c.call(_b);
                }
            }
            catch (_) {
            }
            const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
            return userId ? `user:${userId}` : `ip:${ip}`;
        },
        handler: (req, res, next, options) => {
            res.status(429).json(options.message);
        },
    });
};
exports.rateLimiter = rateLimiter;
exports.defaultLimiter = (0, exports.rateLimiter)();
exports.strictLimiter = (0, exports.rateLimiter)(15 * 60 * 1000, 50);
exports.authLimiter = (0, exports.rateLimiter)(15 * 60 * 1000, 100, {
    status: 429,
    error: 'Too many login attempts. Try again later.',
});
exports.securityLimiter = (0, exports.rateLimiter)(5 * 60 * 1000, 10, {
    status: 429,
    error: 'Too many requests. Access temporarily restricted.',
});
exports.rootPathLimiter = (0, exports.rateLimiter)(1 * 60 * 1000, 5, {
    status: 429,
    error: 'Too many requests to root path.',
});
//# sourceMappingURL=rateLimit.middleware.js.map