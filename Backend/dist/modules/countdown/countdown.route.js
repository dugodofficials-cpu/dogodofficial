"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const countdown_controller_1 = tslib_1.__importDefault(require("../../modules/countdown/countdown.controller"));
const countdown_dto_1 = require("../../modules/countdown/countdown.dto");
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
const permission_middleware_1 = require("../../middlewares/permission.middleware");
const roles_interface_1 = require("../../modules/roles/roles.interface");
class CountdownRoute {
    constructor() {
        this.path = '/countdown';
        this.router = (0, express_1.Router)();
        this.countdownController = new countdown_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/active`, this.countdownController.getActiveCountdown);
        this.router.get(`${this.path}/active/time-remaining`, this.countdownController.getActiveCountdownWithTimeRemaining);
        this.router.get(`${this.path}/:id/time-remaining`, this.countdownController.getTimeRemaining);
        this.router.get(`${this.path}`, (0, validation_middleware_1.default)(countdown_dto_1.GetCountdownsQueryDto, 'query'), auth_middleware_1.default, this.countdownController.getCountdowns);
        this.router.get(`${this.path}/all`, auth_middleware_1.default, this.countdownController.getAllCountdowns);
        this.router.get(`${this.path}/statistics`, auth_middleware_1.default, this.countdownController.getCountdownStatistics);
        this.router.get(`${this.path}/:id`, auth_middleware_1.default, this.countdownController.getCountdownById);
        this.router.post(`${this.path}`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.CREATE_COUNTDOWN), (0, validation_middleware_1.default)(countdown_dto_1.CreateCountdownDto, 'body'), this.countdownController.createCountdown);
        this.router.put(`${this.path}/:id`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPDATE_COUNTDOWN), (0, validation_middleware_1.default)(countdown_dto_1.UpdateCountdownDto, 'body', true), this.countdownController.updateCountdown);
        this.router.delete(`${this.path}/:id`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.DELETE_COUNTDOWN), this.countdownController.deleteCountdown);
        this.router.post(`${this.path}/update-expired`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPDATE_COUNTDOWN), this.countdownController.updateExpiredCountdowns);
        this.router.post(`${this.path}/:id/activate`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPDATE_COUNTDOWN), this.countdownController.activateCountdown);
        this.router.post(`${this.path}/deactivate-all`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPDATE_COUNTDOWN), this.countdownController.deactivateAllCountdowns);
    }
}
exports.default = CountdownRoute;
//# sourceMappingURL=countdown.route.js.map