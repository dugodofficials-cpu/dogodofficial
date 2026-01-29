import { Routes } from '../../interfaces/routes.interface';
import AlbumCoverController from './album-covers.controller';
declare class AlbumCoverRoute implements Routes {
    path: string;
    router: import("express-serve-static-core").Router;
    albumCoverController: AlbumCoverController;
    constructor();
    private initializeRoutes;
}
export default AlbumCoverRoute;
