import { Router } from 'express';
import CountdownController from '@/modules/countdown/countdown.controller';
import { CreateCountdownDto, UpdateCountdownDto, GetCountdownsQueryDto } from '@/modules/countdown/countdown.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';
import { hasPermission } from '@middlewares/permission.middleware';
import { Permission } from '@/modules/roles/roles.interface';
class CountdownRoute implements Routes {
  public path = '/countdown';
  public router = Router();
  public countdownController = new CountdownController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}/active`, this.countdownController.getActiveCountdown);
    this.router.get(`${this.path}/active/time-remaining`, this.countdownController.getActiveCountdownWithTimeRemaining);
    this.router.get(`${this.path}/:id/time-remaining`, this.countdownController.getTimeRemaining);
    this.router.get(`${this.path}`, validationMiddleware(GetCountdownsQueryDto, 'query'), authMiddleware, this.countdownController.getCountdowns);
    this.router.get(`${this.path}/all`, authMiddleware, this.countdownController.getAllCountdowns);
    this.router.get(`${this.path}/statistics`, authMiddleware, this.countdownController.getCountdownStatistics);
    this.router.get(`${this.path}/:id`, authMiddleware, this.countdownController.getCountdownById);
    this.router.post(`${this.path}`,
      authMiddleware,
      hasPermission(Permission.CREATE_COUNTDOWN),
      validationMiddleware(CreateCountdownDto, 'body'),
      this.countdownController.createCountdown
    );
    this.router.put(`${this.path}/:id`,
      authMiddleware,
      hasPermission(Permission.UPDATE_COUNTDOWN),
      validationMiddleware(UpdateCountdownDto, 'body', true),
      this.countdownController.updateCountdown
    );
    this.router.delete(`${this.path}/:id`,
      authMiddleware,
      hasPermission(Permission.DELETE_COUNTDOWN),
      this.countdownController.deleteCountdown
    );
    this.router.post(`${this.path}/update-expired`,
      authMiddleware,
      hasPermission(Permission.UPDATE_COUNTDOWN),
      this.countdownController.updateExpiredCountdowns
    );
    this.router.post(`${this.path}/:id/activate`,
      authMiddleware,
      hasPermission(Permission.UPDATE_COUNTDOWN),
      this.countdownController.activateCountdown
    );
    this.router.post(`${this.path}/deactivate-all`,
      authMiddleware,
      hasPermission(Permission.UPDATE_COUNTDOWN),
      this.countdownController.deactivateAllCountdowns
    );
  }
}
export default CountdownRoute;