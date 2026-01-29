"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const app_1 = tslib_1.__importDefault(require("./app"));
const auth_route_1 = tslib_1.__importDefault(require("./modules/auth/auth.route"));
const index_route_1 = tslib_1.__importDefault(require("./modules/index.route"));
const orders_route_1 = tslib_1.__importDefault(require("./modules/orders/orders.route"));
const payments_route_1 = tslib_1.__importDefault(require("./modules/payments/payments.route"));
const products_route_1 = tslib_1.__importDefault(require("./modules/products/products.route"));
const cart_route_1 = tslib_1.__importDefault(require("./modules/cart/cart.route"));
const users_route_1 = tslib_1.__importDefault(require("./modules/users/users.route"));
const countries_route_1 = tslib_1.__importDefault(require("./modules/countries/countries.route"));
const coupons_route_1 = tslib_1.__importDefault(require("./modules/coupons/coupons.route"));
const roles_route_1 = tslib_1.__importDefault(require("./modules/roles/roles.route"));
const album_covers_route_1 = tslib_1.__importDefault(require("./modules/album-covers/album-covers.route"));
const email_route_1 = require("./modules/email/email.route");
const blackbox_route_1 = tslib_1.__importDefault(require("./modules/blackbox/blackbox.route"));
const countdown_route_1 = tslib_1.__importDefault(require("./modules/countdown/countdown.route"));
const validateEnv_1 = tslib_1.__importDefault(require("./utils/validateEnv"));
const shipping_route_1 = tslib_1.__importDefault(require("./modules/shipping/shipping.route"));
const jobProcessor_service_1 = tslib_1.__importDefault(require("./services/jobProcessor.service"));
(0, validateEnv_1.default)();
jobProcessor_service_1.default.start();
const app = new app_1.default([
    new index_route_1.default(),
    new users_route_1.default(),
    new auth_route_1.default(),
    new products_route_1.default(),
    new orders_route_1.default(),
    new countries_route_1.default(),
    new payments_route_1.default(),
    new cart_route_1.default(),
    new coupons_route_1.default(),
    new roles_route_1.default(),
    new album_covers_route_1.default(),
    new email_route_1.EmailRoute(),
    new blackbox_route_1.default(),
    new countdown_route_1.default(),
    new shipping_route_1.default(),
]);
app.listen();
//# sourceMappingURL=server.js.map