"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HttpException_1 = require("../../exceptions/HttpException");
const util_1 = require("../../utils/util");
const roles_interface_1 = require("../../modules/roles/roles.interface");
const roles_model_1 = require("../../modules/roles/roles.model");
const users_model_1 = tslib_1.__importDefault(require("../../modules/users/users.model"));
class RoleService {
    async findAllRoles() {
        const roles = await roles_model_1.RoleModel.find();
        return roles;
    }
    async findRoleById(roleId) {
        if ((0, util_1.isEmpty)(roleId))
            throw new HttpException_1.HttpException(400, 'RoleId is empty');
        const findRole = await roles_model_1.RoleModel.findById(roleId);
        if (!findRole)
            throw new HttpException_1.HttpException(409, "Role doesn't exist");
        return findRole;
    }
    async createRole(roleData) {
        if ((0, util_1.isEmpty)(roleData))
            throw new HttpException_1.HttpException(400, 'roleData is empty');
        const findRole = await roles_model_1.RoleModel.findOne({ name: roleData.name });
        if (findRole)
            throw new HttpException_1.HttpException(409, `Role ${roleData.name} already exists`);
        const createRoleData = await roles_model_1.RoleModel.create(roleData);
        return createRoleData;
    }
    async updateRole(roleId, roleData) {
        if ((0, util_1.isEmpty)(roleData))
            throw new HttpException_1.HttpException(400, 'roleData is empty');
        if (roleData.name) {
            const findRole = await roles_model_1.RoleModel.findOne({ name: roleData.name, _id: { $ne: roleId } });
            if (findRole)
                throw new HttpException_1.HttpException(409, `Role ${roleData.name} already exists`);
        }
        const updateRoleById = await roles_model_1.RoleModel.findByIdAndUpdate(roleId, roleData, { new: true });
        if (!updateRoleById)
            throw new HttpException_1.HttpException(409, "Role doesn't exist");
        return updateRoleById;
    }
    async deleteRole(roleId) {
        const deleteRoleById = await roles_model_1.RoleModel.findByIdAndDelete(roleId);
        if (!deleteRoleById)
            throw new HttpException_1.HttpException(409, "Role doesn't exist");
        await roles_model_1.UserRoleModel.deleteMany({ roleId });
        return deleteRoleById;
    }
    async assignRole(assignRoleData, assignedBy) {
        if ((0, util_1.isEmpty)(assignRoleData))
            throw new HttpException_1.HttpException(400, 'assignRoleData is empty');
        const user = await users_model_1.default.findById(assignRoleData.userId);
        if (!user)
            throw new HttpException_1.HttpException(409, "User doesn't exist");
        const role = await roles_model_1.RoleModel.findById(assignRoleData.roleId);
        if (!role)
            throw new HttpException_1.HttpException(409, "Role doesn't exist");
        const existingAssignment = await roles_model_1.UserRoleModel.findOne({ userId: assignRoleData.userId });
        if (existingAssignment) {
            const updatedAssignment = await roles_model_1.UserRoleModel.findByIdAndUpdate(existingAssignment._id, {
                roleId: assignRoleData.roleId,
                assignedBy,
                assignedAt: new Date(),
            }, { new: true });
            return updatedAssignment;
        }
        else {
            const createUserRoleData = await roles_model_1.UserRoleModel.create(Object.assign(Object.assign({}, assignRoleData), { assignedBy, assignedAt: new Date() }));
            return createUserRoleData;
        }
    }
    async revokeRole(userId, roleId) {
        const deleteUserRole = await roles_model_1.UserRoleModel.findOneAndDelete({
            userId,
            roleId,
        });
        if (!deleteUserRole)
            throw new HttpException_1.HttpException(409, "User role assignment doesn't exist");
    }
    async getUserRoles(userId) {
        const userRoles = await roles_model_1.UserRoleModel.find({ userId }).populate('roleId');
        return userRoles.map(ur => ur.roleId);
    }
    async getUserCurrentRole(userId) {
        const userRole = await roles_model_1.UserRoleModel.findOne({ userId }).populate('roleId');
        return userRole ? userRole.roleId : null;
    }
    async hasPermission({ userId, permission, email }) {
        var _a;
        let userRole = null;
        if (email) {
            const user = await users_model_1.default.findOne({ email });
            userRole = await roles_model_1.UserRoleModel.findOne({ userId: (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString() }).populate('roleId');
        }
        else {
            userRole = await roles_model_1.UserRoleModel.findOne({ userId }).populate('roleId');
        }
        if (!userRole)
            return false;
        return userRole.roleId.permissions.includes(permission);
    }
    async hasRole(userId, roleName) {
        const role = await roles_model_1.RoleModel.findOne({ name: roleName });
        if (!role)
            return false;
        const userRole = await roles_model_1.UserRoleModel.findOne({
            userId,
            roleId: role._id,
        });
        return !!userRole;
    }
    async getPermissions() {
        const permissions = Object.values(roles_interface_1.Permission);
        return permissions;
    }
}
exports.default = RoleService;
//# sourceMappingURL=roles.service.js.map