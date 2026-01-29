"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const album_covers_service_1 = tslib_1.__importDefault(require("./album-covers.service"));
const s3Public_1 = tslib_1.__importDefault(require("../../utils/s3Public"));
class AlbumCoverController {
    constructor() {
        this.albumCoverService = new album_covers_service_1.default();
        this.getAlbumCovers = async (req, res, next) => {
            try {
                const findAllAlbumCovers = await this.albumCoverService.findAllAlbumCovers();
                res.status(200).json({ data: findAllAlbumCovers, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getAlbumCoverById = async (req, res, next) => {
            try {
                const albumCoverId = req.params.id;
                const findOneAlbumCover = await this.albumCoverService.findAlbumCoverById(albumCoverId);
                res.status(200).json({ data: findOneAlbumCover, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createAlbumCover = async (req, res, next) => {
            try {
                const albumCoverData = req.body;
                const file = req.file;
                if (file) {
                    const { url } = await s3Public_1.default.uploadPublicFile(file, 'album-covers');
                    albumCoverData.imageUrl = url;
                }
                const createAlbumCover = await this.albumCoverService.createAlbumCover(albumCoverData);
                res.status(201).json({ data: createAlbumCover, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateAlbumCover = async (req, res, next) => {
            try {
                const albumCoverId = req.params.id;
                const albumCoverData = req.body;
                const file = req.file;
                if (file) {
                    const { url } = await s3Public_1.default.uploadPublicFile(file, 'album-covers');
                    albumCoverData.imageUrl = url;
                }
                const updateAlbumCover = await this.albumCoverService.updateAlbumCover(albumCoverId, albumCoverData);
                res.status(200).json({ data: updateAlbumCover, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteAlbumCover = async (req, res, next) => {
            try {
                const albumCoverId = req.params.id;
                const deleteAlbumCover = await this.albumCoverService.deleteAlbumCover(albumCoverId);
                res.status(200).json({ data: deleteAlbumCover, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = AlbumCoverController;
//# sourceMappingURL=album-covers.controller.js.map