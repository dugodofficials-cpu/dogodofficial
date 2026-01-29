"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
class IndexController {
    constructor() {
        this.index = (req, res, next) => {
            try {
                logger_1.logger.info(`health check from ${req.ip}`);
                res.status(200).json({ status: 'ok' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = IndexController;
//# sourceMappingURL=index.controller.js.map