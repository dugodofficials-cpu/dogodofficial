"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const users_service_1 = tslib_1.__importDefault(require("../../modules/users/users.service"));
class UsersController {
    constructor() {
        this.userService = new users_service_1.default();
        this.getUserStatistics = async (req, res, next) => {
            try {
                const userStatistics = await this.userService.userStatistics();
                res.status(200).json({ data: userStatistics, message: 'userStatistics' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUsers = async (req, res, next) => {
            try {
                const query = {
                    pagination: {
                        page: req.query.page ? parseInt(req.query.page) : 1,
                        limit: req.query.limit ? parseInt(req.query.limit) : 10,
                    },
                    sort: {
                        field: req.query.sortBy || 'createdAt',
                        order: req.query.sortOrder || 'desc',
                    },
                    filters: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (req.query.email && { email: req.query.email })), (req.query.firstName && { firstName: req.query.firstName })), (req.query.lastName && { lastName: req.query.lastName })), (req.query.phone && { phone: req.query.phone })), (req.query['address.city'] && { 'address.city': req.query['address.city'] })), (req.query['address.state'] && { 'address.state': req.query['address.state'] })), (req.query['address.country'] && { 'address.country': req.query['address.country'] })), (req.query.country && { country: req.query.country })), (req.query.search && { search: req.query.search })), (req.query.role && { role: req.query.role })), (req.query.status && { status: req.query.status })),
                };
                const result = await this.userService.findUsersWithFilters(query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserById = async (req, res, next) => {
            try {
                const userId = req.params.id;
                const findOneUserData = await this.userService.findUserById(userId);
                res.status(200).json({ data: findOneUserData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createUser = async (req, res, next) => {
            try {
                const userData = req.body;
                const createUserData = await this.userService.createUser(userData);
                res.status(201).json({ data: createUserData, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateUser = async (req, res, next) => {
            try {
                const userId = req.params.id;
                const userData = req.body;
                const updateUserData = await this.userService.updateUser(userId, userData);
                res.status(200).json({ data: updateUserData, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteUser = async (req, res, next) => {
            try {
                const userId = req.params.id;
                const deleteUserData = await this.userService.deleteUser(userId);
                res.status(200).json({ data: deleteUserData, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = UsersController;
//# sourceMappingURL=users.controller.js.map