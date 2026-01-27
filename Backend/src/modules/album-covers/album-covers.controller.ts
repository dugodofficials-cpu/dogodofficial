import { NextFunction, Request, Response } from 'express';
import { CreateAlbumCoverDto, UpdateAlbumCoverDto } from './album-covers.dto';
import { AlbumCover } from './album-covers.interface';
import AlbumCoverService from './album-covers.service';
import s3PublicService from '@/utils/s3Public';
class AlbumCoverController {
  public albumCoverService = new AlbumCoverService();
  public getAlbumCovers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllAlbumCovers: AlbumCover[] = await this.albumCoverService.findAllAlbumCovers();
      res.status(200).json({ data: findAllAlbumCovers, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getAlbumCoverById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const albumCoverId: string = req.params.id;
      const findOneAlbumCover: AlbumCover = await this.albumCoverService.findAlbumCoverById(albumCoverId);
      res.status(200).json({ data: findOneAlbumCover, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public createAlbumCover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const albumCoverData = req.body;
      const file = req.file;
      if (file) {
        const { url } = await s3PublicService.uploadPublicFile(file, 'album-covers');
        albumCoverData.imageUrl = url;
      }
      const createAlbumCover: AlbumCover = await this.albumCoverService.createAlbumCover(albumCoverData);
      res.status(201).json({ data: createAlbumCover, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateAlbumCover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const albumCoverId: string = req.params.id;
      const albumCoverData = req.body;
      const file = req.file;
      if (file) {
        const { url } = await s3PublicService.uploadPublicFile(file, 'album-covers');
        albumCoverData.imageUrl = url;
      }
      const updateAlbumCover: AlbumCover = await this.albumCoverService.updateAlbumCover(albumCoverId, albumCoverData);
      res.status(200).json({ data: updateAlbumCover, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteAlbumCover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const albumCoverId: string = req.params.id;
      const deleteAlbumCover: AlbumCover = await this.albumCoverService.deleteAlbumCover(albumCoverId);
      res.status(200).json({ data: deleteAlbumCover, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
export default AlbumCoverController;