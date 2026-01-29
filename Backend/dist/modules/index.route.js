"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_controller_1 = tslib_1.__importDefault(require("../modules/index.controller"));
const express_1 = require("express");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
class IndexRoute {
    constructor() {
        this.path = '/';
        this.router = (0, express_1.Router)();
        this.indexController = new index_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, rateLimit_middleware_1.rootPathLimiter, this.indexController.index);
    }
}
exports.default = IndexRoute;
//# sourceMappingURL=index.route.js.map