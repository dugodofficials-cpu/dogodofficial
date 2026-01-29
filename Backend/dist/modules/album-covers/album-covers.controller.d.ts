import { NextFunction, Request, Response } from 'express';
import AlbumCoverService from './album-covers.service';
declare class AlbumCoverController {
    albumCoverService: AlbumCoverService;
    getAlbumCovers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAlbumCoverById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createAlbumCover: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateAlbumCover: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteAlbumCover: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default AlbumCoverController;
