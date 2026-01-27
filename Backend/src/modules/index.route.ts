import IndexController from '@/modules/index.controller';
import { Routes } from '@interfaces/routes.interface';
import { Router } from 'express';
import { rootPathLimiter } from '@middlewares/rateLimit.middleware';
class IndexRoute implements Routes {
  public path = '/';
  public router = Router();
  public indexController = new IndexController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, rootPathLimiter, this.indexController.index);
  }
}
export default IndexRoute;