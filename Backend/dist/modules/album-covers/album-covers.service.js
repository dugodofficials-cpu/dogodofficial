"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HttpException_1 = require("../../exceptions/HttpException");
const album_covers_model_1 = require("./album-covers.model");
const util_1 = require("../../utils/util");
const s3Public_1 = tslib_1.__importDefault(require("../../utils/s3Public"));
class AlbumCoverService {
    constructor() {
        this.albumCover = album_covers_model_1.AlbumCoverModel;
    }
    async findAllAlbumCovers() {
        return this.albumCover.find();
    }
    async findAlbumCoverById(albumCoverId) {
        if ((0, util_1.isEmpty)(albumCoverId))
            throw new HttpException_1.HttpException(400, 'Album cover ID is required');
        const findAlbumCover = await this.albumCover.findById(albumCoverId);
        if (!findAlbumCover)
            throw new HttpException_1.HttpException(404, 'Album cover not found');
        return findAlbumCover;
    }
    async createAlbumCover(albumCoverData) {
        return this.albumCover.create(albumCoverData);
    }
    async updateAlbumCover(albumCoverId, albumCoverData) {
        if ((0, util_1.isEmpty)(albumCoverData))
            throw new HttpException_1.HttpException(400, 'Album cover data is required');
        const updateAlbumCoverById = await this.albumCover.findByIdAndUpdate(albumCoverId, albumCoverData, { new: true });
        if (!updateAlbumCoverById)
            throw new HttpException_1.HttpException(404, 'Album cover not found');
        return updateAlbumCoverById;
    }
    async deleteAlbumCover(albumCoverId) {
        const deleteAlbumCoverById = await this.albumCover.findByIdAndDelete(albumCoverId);
        if (!deleteAlbumCoverById)
            throw new HttpException_1.HttpException(404, 'Album cover not found');
        const urlParts = deleteAlbumCoverById.imageUrl.split('/');
        const key = urlParts[urlParts.length - 1];
        try {
            await s3Public_1.default.deleteFile(key);
        }
        catch (error) {
            console.error('Failed to delete file from S3:', error);
        }
        return deleteAlbumCoverById;
    }
}
exports.default = AlbumCoverService;
//# sourceMappingURL=album-covers.service.js.map