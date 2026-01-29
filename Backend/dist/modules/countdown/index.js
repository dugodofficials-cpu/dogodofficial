"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countdownModel = exports.CountdownService = exports.CountdownController = exports.CountdownRoute = void 0;
const tslib_1 = require("tslib");
var countdown_route_1 = require("./countdown.route");
Object.defineProperty(exports, "CountdownRoute", { enumerable: true, get: function () { return tslib_1.__importDefault(countdown_route_1).default; } });
var countdown_controller_1 = require("./countdown.controller");
Object.defineProperty(exports, "CountdownController", { enumerable: true, get: function () { return tslib_1.__importDefault(countdown_controller_1).default; } });
var countdown_service_1 = require("./countdown.service");
Object.defineProperty(exports, "CountdownService", { enumerable: true, get: function () { return tslib_1.__importDefault(countdown_service_1).default; } });
var countdown_model_1 = require("./countdown.model");
Object.defineProperty(exports, "countdownModel", { enumerable: true, get: function () { return tslib_1.__importDefault(countdown_model_1).default; } });
tslib_1.__exportStar(require("./countdown.interface"), exports);
tslib_1.__exportStar(require("./countdown.dto"), exports);
//# sourceMappingURL=index.js.map