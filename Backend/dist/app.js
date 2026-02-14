"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const compression_1 = tslib_1.__importDefault(require("compression"));
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const express_1 = tslib_1.__importDefault(require("express"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const hpp_1 = tslib_1.__importDefault(require("hpp"));
const morgan_1 = tslib_1.__importDefault(require("morgan"));
const mongoose_1 = require("mongoose");
const swagger_jsdoc_1 = tslib_1.__importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = tslib_1.__importDefault(require("swagger-ui-express"));
const _config_1 = require("./config");
const _databases_1 = require("./databases");
const error_middleware_1 = tslib_1.__importDefault(require("./middlewares/error.middleware"));
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const security_middleware_1 = require("./middlewares/security.middleware");
const logger_1 = require("./utils/logger");
class App {
    constructor(routes) {
        this.app = (0, express_1.default)();
        this.env = _config_1.NODE_ENV || 'development';
        this.port = _config_1.PORT || 3000;
        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeErrorHandling();
    }
    listen() {
        this.app.listen(this.port, () => {
            logger_1.logger.info(`=================================`);
            logger_1.logger.info(`======= ENV: ${this.env} =======`);
            logger_1.logger.info(`App listening on the port ${this.port}`);
            logger_1.logger.info(`=================================`);
        });
    }
    async closeDatabaseConnection() {
        try {
            await (0, mongoose_1.disconnect)();
            logger_1.logger.info('Disconnected from MongoDB');
        }
        catch (error) {
            logger_1.logger.error('Error closing database connection:', error);
        }
    }
    getServer() {
        return this.app;
    }
    async connectToDatabase() {
        if (this.env !== 'production') {
            (0, mongoose_1.set)('debug', true);
        }
        (0, mongoose_1.set)('strictQuery', false);
        await (0, mongoose_1.connect)(_databases_1.dbConnection.url);
        await mongoose_1.connection.db.admin().command({ ping: 1 });
        logger_1.logger.info('Pinged your deployment. You successfully connected to MongoDB!');
    }
    initializeMiddlewares() {
        this.app.set('trust proxy', 1);
        this.app.use(security_middleware_1.strictSecurity);
        this.app.use((0, morgan_1.default)(_config_1.LOG_FORMAT, { stream: logger_1.stream }));
        const allowedOrigins = _config_1.ORIGIN ? _config_1.ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean) : [];
        const corsOrigin = this.env === 'development'
            ? true
            : (allowedOrigins.length > 0 ? allowedOrigins : true);
        this.app.use((0, cors_1.default)({
            origin: corsOrigin,
            credentials: _config_1.CREDENTIALS,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            maxAge: 86400
        }));
        this.app.options('*', (req, res) => {
            res.sendStatus(200);
        });
        this.app.use((0, hpp_1.default)());
        this.app.use((0, helmet_1.default)());
        this.app.use((0, compression_1.default)());
        this.app.use((req, res, next) => {
            if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
                return next();
            }
            next();
        });
        this.app.use(express_1.default.json({ limit: '3gb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '3gb' }));
        this.app.use((0, cookie_parser_1.default)());
        this.app.use((req, res, next) => {
            if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
                console.error('[APP DEBUG] Skipping rate limiter for multipart request', {
                    method: req.method,
                    path: req.path,
                    contentLength: req.headers['content-length']
                });
                return next();
            }
            (0, rateLimit_middleware_1.defaultLimiter)(req, res, next);
        });
    }
    initializeRoutes(routes) {
        routes.forEach(route => {
            this.app.use('/', route.router);
        });
    }
    initializeSwagger() {
        const options = {
            swaggerDefinition: {
                info: {
                    title: 'REST API',
                    version: '1.0.0',
                    description: 'Dugod official API docs',
                },
            },
            apis: ['swagger.yaml'],
        };
        const specs = (0, swagger_jsdoc_1.default)(options);
        this.app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
    }
    initializeErrorHandling() {
        this.app.use(error_middleware_1.default);
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map