"use strict";
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = exports.shippingConfig = exports.dbConfig = exports.ZEPTO_DOMAIN = exports.ZEPTO_API_TOKEN = exports.GOOGLE_CLIENT_ID = exports.AWS_S3_BUCKET = exports.AWS_REGION = exports.AWS_SECRET_ACCESS_KEY = exports.AWS_ACCESS_KEY_ID = exports.APP_URL = exports.PAYSTACK_PUBLIC_KEY = exports.PAYSTACK_SECRET_KEY = exports.DB_URI = exports.DB_DATABASE = exports.DB_PORT = exports.DB_HOST = exports.MONGODB_URI = exports.ORIGIN = exports.LOG_DIR = exports.LOG_FORMAT = exports.SECRET_KEY = exports.PORT = exports.NODE_ENV = exports.CREDENTIALS = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: `.env.${process.env.NODE_ENV || 'development'}` });
exports.CREDENTIALS = process.env.CREDENTIALS === 'true';
_a = process.env, exports.NODE_ENV = _a.NODE_ENV, exports.PORT = _a.PORT, exports.SECRET_KEY = _a.SECRET_KEY, exports.LOG_FORMAT = _a.LOG_FORMAT, exports.LOG_DIR = _a.LOG_DIR, exports.ORIGIN = _a.ORIGIN;
_b = process.env, exports.MONGODB_URI = _b.MONGODB_URI, exports.DB_HOST = _b.DB_HOST, exports.DB_PORT = _b.DB_PORT, exports.DB_DATABASE = _b.DB_DATABASE, exports.DB_URI = _b.DB_URI;
_c = process.env, exports.PAYSTACK_SECRET_KEY = _c.PAYSTACK_SECRET_KEY, exports.PAYSTACK_PUBLIC_KEY = _c.PAYSTACK_PUBLIC_KEY, exports.APP_URL = _c.APP_URL;
_d = process.env, exports.AWS_ACCESS_KEY_ID = _d.AWS_ACCESS_KEY_ID, exports.AWS_SECRET_ACCESS_KEY = _d.AWS_SECRET_ACCESS_KEY, exports.AWS_REGION = _d.AWS_REGION, exports.AWS_S3_BUCKET = _d.AWS_S3_BUCKET;
exports.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
_e = process.env, exports.ZEPTO_API_TOKEN = _e.ZEPTO_API_TOKEN, exports.ZEPTO_DOMAIN = _e.ZEPTO_DOMAIN;
exports.dbConfig = {
    url: process.env.MONGODB_URL,
    database: process.env.MONGODB_DATABASE,
};
exports.shippingConfig = {
    dhl: {
        apiEndpoint: process.env.DHL_API_ENDPOINT || '',
        apiKey: process.env.DHL_API_KEY,
        accountNumber: process.env.DHL_ACCOUNT_NUMBER,
    },
};
exports.appConfig = {
    credentials: exports.CREDENTIALS,
    env: exports.NODE_ENV,
    port: exports.PORT,
    secretKey: exports.SECRET_KEY,
    logFormat: exports.LOG_FORMAT,
    logDir: exports.LOG_DIR,
    origin: exports.ORIGIN,
    db: exports.dbConfig,
    shipping: exports.shippingConfig,
    google: {
        clientId: exports.GOOGLE_CLIENT_ID,
    },
    zepto: {
        apiToken: exports.ZEPTO_API_TOKEN,
        domain: exports.ZEPTO_DOMAIN,
        url: 'api.zeptomail.com/'
    },
};
//# sourceMappingURL=index.js.map