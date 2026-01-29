"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const album_covers_controller_1 = tslib_1.__importDefault(require("./album-covers.controller"));
const album_covers_dto_1 = require("./album-covers.dto");
const validation_middleware_1 = tslib_1.__importDefault(require("../../middlewares/validation.middleware"));
const upload_middleware_1 = tslib_1.__importDefault(require("../../middlewares/upload.middleware"));
const permission_middleware_1 = require("../../middlewares/permission.middleware");
const roles_interface_1 = require("../roles/roles.interface");
const auth_middleware_1 = tslib_1.__importDefault(require("../../middlewares/auth.middleware"));
class AlbumCoverRoute {
    constructor() {
        this.path = '/album-cover';
        this.router = (0, express_1.Router)();
        this.albumCoverController = new album_covers_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPLOAD_MEDIA)], this.albumCoverController.getAlbumCovers);
        this.router.get(`${this.path}/:id`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPLOAD_MEDIA)], this.albumCoverController.getAlbumCoverById);
        this.router.post(`${this.path}`, [auth_middleware_1.default, upload_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPLOAD_MEDIA)], this.albumCoverController.createAlbumCover);
        this.router.put(`${this.path}/:id`, [auth_middleware_1.default, upload_middleware_1.default, (0, validation_middleware_1.default)(album_covers_dto_1.UpdateAlbumCoverDto, 'body'), (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPLOAD_MEDIA)], this.albumCoverController.updateAlbumCover);
        this.router.delete(`${this.path}/:id`, [auth_middleware_1.default, (0, permission_middleware_1.hasPermission)(roles_interface_1.Permission.UPLOAD_MEDIA)], this.albumCoverController.deleteAlbumCover);
    }
}
exports.default = AlbumCoverRoute;
//# sourceMappingURL=album-covers.route.js.map