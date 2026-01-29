"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HttpException_1 = require("../../exceptions/HttpException");
const util_1 = require("../../utils/util");
const session_interface_1 = require("./session.interface");
const session_model_1 = tslib_1.__importDefault(require("./session.model"));
class SessionService {
    constructor() {
        this.sessions = session_model_1.default;
    }
    async createSession(userId, token, ipAddress, userAgent, expiresIn = 180 * 24 * 60 * 60) {
        if ((0, util_1.isEmpty)(userId) || (0, util_1.isEmpty)(token)) {
            throw new HttpException_1.HttpException(400, 'UserId and token are required');
        }
        const expiresAt = new Date(Date.now() + expiresIn * 1000);
        const session = await this.sessions.create({
            user: userId,
            token,
            ipAddress,
            userAgent,
            status: session_interface_1.SessionStatus.ACTIVE,
            lastActivityAt: new Date(),
            expiresAt,
        });
        return session;
    }
    async findSessionByToken(token) {
        if ((0, util_1.isEmpty)(token)) {
            return null;
        }
        return await this.sessions.findOne({
            token,
            status: session_interface_1.SessionStatus.ACTIVE,
            expiresAt: { $gt: new Date() },
        });
    }
    async findUserSessions(userId, includeExpired = false) {
        if ((0, util_1.isEmpty)(userId)) {
            throw new HttpException_1.HttpException(400, 'UserId is required');
        }
        const query = { user: userId };
        if (!includeExpired) {
            query.status = session_interface_1.SessionStatus.ACTIVE;
            query.expiresAt = { $gt: new Date() };
        }
        return await this.sessions.find(query).sort({ lastActivityAt: -1 });
    }
    async updateLastActivity(token) {
        if ((0, util_1.isEmpty)(token)) {
            return;
        }
        await this.sessions.findOneAndUpdate({ token, status: session_interface_1.SessionStatus.ACTIVE }, { lastActivityAt: new Date() });
    }
    async revokeSession(token) {
        if ((0, util_1.isEmpty)(token)) {
            throw new HttpException_1.HttpException(400, 'Token is required');
        }
        await this.sessions.findOneAndUpdate({ token }, { status: session_interface_1.SessionStatus.REVOKED });
    }
    async revokeAllUserSessions(userId, excludeToken) {
        if ((0, util_1.isEmpty)(userId)) {
            throw new HttpException_1.HttpException(400, 'UserId is required');
        }
        const query = {
            user: userId,
            status: session_interface_1.SessionStatus.ACTIVE,
        };
        if (excludeToken) {
            query.token = { $ne: excludeToken };
        }
        await this.sessions.updateMany(query, { status: session_interface_1.SessionStatus.REVOKED });
    }
    async revokeSessionById(sessionId, userId) {
        if ((0, util_1.isEmpty)(sessionId) || (0, util_1.isEmpty)(userId)) {
            throw new HttpException_1.HttpException(400, 'SessionId and UserId are required');
        }
        const session = await this.sessions.findOne({
            _id: sessionId,
            user: userId,
        });
        if (!session) {
            throw new HttpException_1.HttpException(404, 'Session not found');
        }
        await this.sessions.findByIdAndUpdate(sessionId, { status: session_interface_1.SessionStatus.REVOKED });
    }
    async cleanupExpiredSessions() {
        const result = await this.sessions.updateMany({
            expiresAt: { $lt: new Date() },
            status: session_interface_1.SessionStatus.ACTIVE,
        }, {
            status: session_interface_1.SessionStatus.EXPIRED,
        });
        return result.modifiedCount;
    }
    async getUserSessionCount(userId) {
        return await this.sessions.countDocuments({
            user: userId,
            status: session_interface_1.SessionStatus.ACTIVE,
            expiresAt: { $gt: new Date() },
        });
    }
}
exports.default = SessionService;
//# sourceMappingURL=session.service.js.map