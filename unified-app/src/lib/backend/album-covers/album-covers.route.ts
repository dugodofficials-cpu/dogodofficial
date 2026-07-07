import { Router } from 'express';
import { Routes } from '@backend/interfaces/routes.interface';
import AlbumCoverController from './album-covers.controller';
import { CreateAlbumCoverDto, UpdateAlbumCoverDto } from './album-covers.dto';
import ValidationMiddleware from '@backend/middlewares/validation.middleware';
import handleMulterUpload from '@backend/middlewares/upload.middleware';
import { hasPermission } from '@backend/middlewares/permission.middleware';
import { Permission } from '../roles/roles.interface';
import authMiddleware from '@backend/middlewares/auth.middleware';
class AlbumCoverRoute implements Routes {
  public path = '/album-cover';
  public router = Router();
  public albumCoverController = new AlbumCoverController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, [authMiddleware, hasPermission(Permission.UPLOAD_MEDIA)], this.albumCoverController.getAlbumCovers);
    this.router.get(`${this.path}/:id`, [authMiddleware, hasPermission(Permission.UPLOAD_MEDIA)], this.albumCoverController.getAlbumCoverById);
    this.router.post(
      `${this.path}`,
      [authMiddleware, handleMulterUpload, hasPermission(Permission.UPLOAD_MEDIA)],
      this.albumCoverController.createAlbumCover
    );
    this.router.put(
      `${this.path}/:id`,
      [authMiddleware, handleMulterUpload, ValidationMiddleware(UpdateAlbumCoverDto, 'body'), hasPermission(Permission.UPLOAD_MEDIA)],
      this.albumCoverController.updateAlbumCover
    );
    this.router.delete(
      `${this.path}/:id`,
      [authMiddleware, hasPermission(Permission.UPLOAD_MEDIA)],
      this.albumCoverController.deleteAlbumCover
    );
  }
}
export default AlbumCoverRoute;