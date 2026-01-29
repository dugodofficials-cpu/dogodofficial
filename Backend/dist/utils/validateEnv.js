"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envalid_1 = require("envalid");
const validateEnv = () => {
    (0, envalid_1.cleanEnv)(process.env, {
        NODE_ENV: (0, envalid_1.str)(),
        PORT: (0, envalid_1.port)(),
        PAYSTACK_SECRET_KEY: (0, envalid_1.str)(),
        GOOGLE_CLIENT_ID: (0, envalid_1.str)(),
        AWS_ACCESS_KEY_ID: (0, envalid_1.str)(),
        AWS_SECRET_ACCESS_KEY: (0, envalid_1.str)(),
        AWS_REGION: (0, envalid_1.str)(),
        AWS_S3_BUCKET: (0, envalid_1.str)(),
        AWS_S3_PUBLIC_BUCKET: (0, envalid_1.str)(),
        ZEPTO_API_TOKEN: (0, envalid_1.str)(),
        ZEPTO_DOMAIN: (0, envalid_1.str)(),
    });
};
exports.default = validateEnv;
//# sourceMappingURL=validateEnv.js.map