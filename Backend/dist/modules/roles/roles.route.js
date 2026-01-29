"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const roles_controller_1 = tslib_1.__importDefault(require("../../modules/roles/roles.controller"));
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
const roles_dto_1 = require("../../modules/roles/roles.dto");
const roles_interface_1 = require("../../modules/roles/roles.interface");
const permission_middleware_1 = require("../../middlewares/permission.middleware");
class RoleRoute {
    constructor() {
        this.path = '/roles';
        this.router = (0, express_1.Router)();
        this.roleController = new roles_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_ROLE)], this.roleController.getRoles);
        this.router.get(`${this.path}/permissions`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_ROLE)], this.roleController.getPermissions);
        this.router.get(`${this.path}/:id`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_ROLE)], this.roleController.getRoleById);
        this.router.post(`${this.path}`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.CREATE_ROLE), (0, validation_middleware_1.default)(roles_dto_1.CreateRoleDto)], this.roleController.createRole);
        this.router.put(`${this.path}/:id`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPDATE_ROLE), (0, validation_middleware_1.default)(roles_dto_1.UpdateRoleDto)], this.roleController.updateRole);
        this.router.delete(`${this.path}/:id`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.DELETE_ROLE)], this.roleController.deleteRole);
        this.router.post(`${this.path}/assign`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.ASSIGN_ROLE), (0, validation_middleware_1.default)(roles_dto_1.AssignRoleDto)], this.roleController.assignRole);
        this.router.post(`${this.path}/revoke`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.ASSIGN_ROLE), (0, validation_middleware_1.default)(roles_dto_1.RevokeRoleDto)], this.roleController.revokeRole);
        this.router.get(`${this.path}/user/:userId`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_ROLE)], this.roleController.getUserRoles);
        this.router.get(`${this.path}/user/:userId/current`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_ROLE)], this.roleController.getUserCurrentRole);
        this.router.get(`${this.path}/check-permission/:userId/:permission`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_ROLE)], this.roleController.checkPermission);
        this.router.get(`${this.path}/check-role/:userId/:roleName`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_ROLE)], this.roleController.checkRole);
    }
}
exports.default = RoleRoute;
//# sourceMappingURL=roles.route.js.map