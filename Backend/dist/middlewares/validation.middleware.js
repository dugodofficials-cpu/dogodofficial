"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const HttpException_1 = require("../exceptions/HttpException");
const validationMiddleware = (type, value = 'body', skipMissingProperties = false, whitelist = true, forbidNonWhitelisted = true) => {
    return (req, res, next) => {
        (0, class_validator_1.validate)((0, class_transformer_1.plainToInstance)(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors) => {
            if (errors.length > 0) {
                const messages = [];
                const extractErrorMessages = (error) => {
                    if (error.constraints) {
                        messages.push(...Object.values(error.constraints));
                    }
                    if (error.children && error.children.length > 0) {
                        error.children.forEach(extractErrorMessages);
                    }
                };
                errors.forEach(extractErrorMessages);
                const message = messages.join(', ');
                next(new HttpException_1.HttpException(400, message));
            }
            else {
                next();
            }
        });
    };
};
exports.default = validationMiddleware;
//# sourceMappingURL=validation.middleware.js.map