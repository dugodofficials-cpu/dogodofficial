"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const blackbox_controller_1 = tslib_1.__importDefault(require("../../modules/blackbox/blackbox.controller"));
const blackbox_dto_1 = require("../../modules/blackbox/blackbox.dto");
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
const permission_middleware_1 = require("../../middlewares/permission.middleware");
const roles_interface_1 = require("../../modules/roles/roles.interface");
class BlackboxRoute {
    constructor() {
        this.path = '/blackbox';
        this.router = (0, express_1.Router)();
        this.blackboxController = new blackbox_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/questions`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.CREATE_BLACKBOX_QUESTION), (0, validation_middleware_1.default)(blackbox_dto_1.CreateQuestionDto, 'body'), this.blackboxController.createQuestion);
        this.router.get(`${this.path}/questions`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_BLACKBOX_QUESTION), this.blackboxController.getQuestions);
        this.router.get(`${this.path}/questions/:id`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_BLACKBOX_QUESTION), this.blackboxController.getQuestionById);
        this.router.put(`${this.path}/questions/:id`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPDATE_BLACKBOX_QUESTION), (0, validation_middleware_1.default)(blackbox_dto_1.UpdateQuestionDto, 'body', true), this.blackboxController.updateQuestion);
        this.router.delete(`${this.path}/questions/:id`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.DELETE_BLACKBOX_QUESTION), this.blackboxController.deleteQuestion);
        this.router.post(`${this.path}/questions/reorder`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPDATE_BLACKBOX_QUESTION), this.blackboxController.reorderQuestions);
        this.router.post(`${this.path}/answer`, auth_middleware_1.default, (0, validation_middleware_1.default)(blackbox_dto_1.AnswerQuestionDto, 'body'), this.blackboxController.answerQuestion);
        this.router.get(`${this.path}/progress`, auth_middleware_1.default, this.blackboxController.getUserProgress);
        this.router.get(`${this.path}/answered`, auth_middleware_1.default, this.blackboxController.getAnsweredQuestions);
        this.router.get(`${this.path}/next-question`, auth_middleware_1.default, this.blackboxController.getNextUnansweredQuestion);
        this.router.post(`${this.path}/reset`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_BLACKBOX_QUESTION), this.blackboxController.resetUserProgress);
        this.router.get(`${this.path}/statistics`, auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.READ_BLACKBOX_QUESTION), this.blackboxController.getQuestionStatistics);
    }
}
exports.default = BlackboxRoute;
//# sourceMappingURL=blackbox.route.js.map