"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const roles_service_1 = tslib_1.__importDefault(require("../../modules/roles/roles.service"));
class RoleController {
    constructor() {
        this.roleService = new roles_service_1.default();
        this.getRoles = async (req, res, next) => {
            try {
                const findAllRolesData = await this.roleService.findAllRoles();
                res.status(200).json({ data: findAllRolesData, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getRoleById = async (req, res, next) => {
            try {
                const roleId = String(req.params.id);
                const findOneRoleData = await this.roleService.findRoleById(roleId);
                res.status(200).json({ data: findOneRoleData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createRole = async (req, res, next) => {
            try {
                const roleData = req.body;
                const createRoleData = await this.roleService.createRole(roleData);
                res.status(201).json({ data: createRoleData, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateRole = async (req, res, next) => {
            try {
                const roleId = String(req.params.id);
                const roleData = req.body;
                const updateRoleData = await this.roleService.updateRole(roleId, roleData);
                res.status(200).json({ data: updateRoleData, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteRole = async (req, res, next) => {
            try {
                const roleId = String(req.params.id);
                const deleteRoleData = await this.roleService.deleteRole(roleId);
                res.status(200).json({ data: deleteRoleData, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.assignRole = async (req, res, next) => {
            try {
                const assignRoleData = req.body;
                const assignedBy = req.user._id.toString();
                const assignRoleToUser = await this.roleService.assignRole(assignRoleData, assignedBy);
                res.status(200).json({ data: assignRoleToUser, message: 'Role assigned successfully' });
            }
            catch (error) {
                next(error);
            }
        };
        this.revokeRole = async (req, res, next) => {
            try {
                const revokeRoleData = req.body;
                await this.roleService.revokeRole(revokeRoleData.userId, revokeRoleData.roleId);
                res.status(200).json({ message: 'role revoked' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserRoles = async (req, res, next) => {
            try {
                const userId = String(req.params.userId);
                const userRoles = await this.roleService.getUserRoles(userId);
                res.status(200).json({ data: userRoles, message: 'user roles retrieved' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserCurrentRole = async (req, res, next) => {
            try {
                const userId = String(req.params.userId);
                const currentRole = await this.roleService.getUserCurrentRole(userId);
                res.status(200).json({
                    data: currentRole,
                    message: currentRole ? 'User current role retrieved' : 'User has no role assigned'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.checkPermission = async (req, res, next) => {
            try {
                const userId = String(req.params.userId);
                const permission = req.params.permission;
                const hasPermission = await this.roleService.hasPermission({ userId, permission, email: null });
                res.status(200).json({ data: hasPermission, message: 'permission checked' });
            }
            catch (error) {
                next(error);
            }
        };
        this.checkRole = async (req, res, next) => {
            try {
                const userId = String(req.params.userId);
                const roleName = String(req.params.roleName);
                const hasRole = await this.roleService.hasRole(userId, roleName);
                res.status(200).json({ data: hasRole, message: 'role checked' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPermissions = async (req, res, next) => {
            try {
                const permissions = await this.roleService.getPermissions();
                res.status(200).json({ data: permissions, message: 'permissions retrieved' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = RoleController;
//# sourceMappingURL=roles.controller.js.map