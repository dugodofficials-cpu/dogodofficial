"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoleModel = exports.RoleModel = void 0;
const mongoose_1 = require("mongoose");
const roles_interface_1 = require("../../modules/roles/roles.interface");
const roleSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    permissions: [
        {
            type: String,
            enum: Object.values(roles_interface_1.Permission),
            required: true,
        },
    ],
    isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
const userRoleSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true,
    },
    roleId: {
        type: String,
        ref: 'Role',
        required: true,
    },
    assignedBy: {
        type: String,
        ref: 'User',
        required: true,
    },
    assignedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });
exports.RoleModel = (0, mongoose_1.model)('Role', roleSchema);
exports.UserRoleModel = (0, mongoose_1.model)('UserRole', userRoleSchema);
//# sourceMappingURL=roles.model.js.map