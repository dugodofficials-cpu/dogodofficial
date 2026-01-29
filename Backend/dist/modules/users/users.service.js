"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const bcrypt_1 = require("bcrypt");
const HttpException_1 = require("../../exceptions/HttpException");
const users_model_1 = tslib_1.__importDefault(require("../../modules/users/users.model"));
const util_1 = require("../../utils/util");
class UserService {
    constructor() {
        this.users = users_model_1.default;
    }
    async findAllUser() {
        const users = await this.users.find().populate('role').populate('totalOrdersCount').populate('userRoles');
        return users;
    }
    async userStatistics() {
        const totalUsers = await this.users.countDocuments();
        return { totalUsers };
    }
    async findUsersWithFilters(queryParams) {
        const { filters = {}, sort = { field: 'createdAt', order: 'desc' }, pagination = { page: 1, limit: 10 } } = queryParams;
        const filterObj = {};
        if (filters.email) {
            filterObj.email = { $regex: filters.email, $options: 'i' };
        }
        if (filters.firstName) {
            filterObj.firstName = { $regex: filters.firstName, $options: 'i' };
        }
        if (filters.lastName) {
            filterObj.lastName = { $regex: filters.lastName, $options: 'i' };
        }
        if (filters.phone) {
            filterObj.phone = { $regex: filters.phone, $options: 'i' };
        }
        if (filters['address.city']) {
            filterObj['address.city'] = { $regex: filters['address.city'], $options: 'i' };
        }
        if (filters['address.state']) {
            filterObj['address.state'] = { $regex: filters['address.state'], $options: 'i' };
        }
        if (filters['address.country']) {
            filterObj['address.country'] = { $regex: filters['address.country'], $options: 'i' };
        }
        if (filters.search) {
            const searchRegex = { $regex: filters.search, $options: 'i' };
            filterObj.$or = [
                { email: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex },
                { phone: searchRegex },
                { 'address.city': searchRegex },
                { 'address.state': searchRegex },
                { 'address.country': searchRegex },
            ];
        }
        if (filters.role) {
            filterObj.userRoles = filters.role;
        }
        if (filters.status) {
            filterObj.status = filters.status;
        }
        const sortObj = {};
        sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;
        const skip = (pagination.page - 1) * pagination.limit;
        const total = await this.users.countDocuments(filterObj);
        const users = await this.users
            .find(filterObj)
            .populate('totalOrdersCount')
            .populate('userRoles')
            .sort(sortObj)
            .skip(skip)
            .limit(pagination.limit);
        const totalPages = Math.ceil(total / pagination.limit);
        return {
            data: users,
            meta: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                totalPages,
            },
            message: 'success',
        };
    }
    async findUserById(userId) {
        if ((0, util_1.isEmpty)(userId))
            throw new HttpException_1.HttpException(400, 'UserId is empty');
        const findUser = await this.users.findOne({ _id: userId }).populate('role').populate('totalOrdersCount').populate('userRoles');
        if (!findUser)
            throw new HttpException_1.HttpException(409, "User doesn't exist");
        return findUser;
    }
    async createUser(userData) {
        if ((0, util_1.isEmpty)(userData))
            throw new HttpException_1.HttpException(400, 'userData is empty');
        const findUser = await this.users.findOne({ email: userData.email });
        if (findUser)
            throw new HttpException_1.HttpException(409, `This email ${userData.email} already exists`);
        const hashedPassword = await (0, bcrypt_1.hash)(userData.password, 10);
        const createUserData = await this.users.create(Object.assign(Object.assign({}, userData), { password: hashedPassword, status: userData.status || 'active' }));
        const populatedUser = await this.users.findById(createUserData._id).populate('role').populate('totalOrdersCount').populate('userRoles');
        return populatedUser;
    }
    async updateUser(userId, userData) {
        if ((0, util_1.isEmpty)(userData))
            throw new HttpException_1.HttpException(400, 'userData is empty');
        if (userData.email) {
            const findUser = await this.users.findOne({ email: userData.email });
            if (findUser && !findUser._id.equals(userId))
                throw new HttpException_1.HttpException(409, `This email ${userData.email} already exists`);
        }
        const updateData = Object.assign({}, userData);
        if (userData.password) {
            const hashedPassword = await (0, bcrypt_1.hash)(userData.password, 10);
            updateData.password = hashedPassword;
        }
        const updateUserById = await this.users.findByIdAndUpdate(userId, updateData, { new: true }).populate('role').populate('totalOrdersCount').populate('userRoles');
        if (!updateUserById)
            throw new HttpException_1.HttpException(409, "User doesn't exist");
        return updateUserById;
    }
    async deleteUser(userId) {
        const deleteUserById = await this.users.findByIdAndDelete(userId).populate('role').populate('totalOrdersCount').populate('userRoles');
        if (!deleteUserById)
            throw new HttpException_1.HttpException(409, "User doesn't exist");
        return deleteUserById;
    }
}
exports.default = UserService;
//# sourceMappingURL=users.service.js.map