"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = void 0;
const _config_1 = require("../config");
exports.dbConnection = {
    url: _config_1.DB_URI || `mongodb://${_config_1.DB_HOST}:${_config_1.DB_PORT}/${_config_1.DB_DATABASE}`,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
};
//# sourceMappingURL=index.js.map