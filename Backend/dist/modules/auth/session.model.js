"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const session_interface_1 = require("./session.interface");
const sessionSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    ipAddress: {
        type: String,
        required: false,
    },
    userAgent: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: Object.values(session_interface_1.SessionStatus),
        default: session_interface_1.SessionStatus.ACTIVE,
        required: true,
        index: true,
    },
    lastActivityAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
sessionSchema.index({ user: 1, status: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const sessionModel = (0, mongoose_1.model)('Session', sessionSchema);
exports.default = sessionModel;
//# sourceMappingURL=session.model.js.map