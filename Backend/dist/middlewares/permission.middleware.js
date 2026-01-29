"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = void 0;
const tslib_1 = require("tslib");
const HttpException_1 = require("../exceptions/HttpException");
const roles_service_1 = tslib_1.__importDefault(require("../modules/roles/roles.service"));
const roleService = new roles_service_1.default();
const hasPermission = (permission) => {
    return async (req, res, next) => {
        var _a, _b;
        try {
            const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || null;
            const email = ((_b = req.body) === null || _b === void 0 ? void 0 : _b.email) || null;
            const hasRequiredPermission = await roleService.hasPermission({ userId: userId ? userId.toString() : undefined, permission, email: email || undefined });
            if (!hasRequiredPermission) {
                throw new HttpException_1.HttpException(403, 'Access denied. Insufficient permissions.');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.hasPermission = hasPermission;
//# sourceMappingURL=permission.middleware.js.map