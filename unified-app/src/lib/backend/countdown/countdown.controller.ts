import { NextFunction, Request, Response } from 'express';
import { CreateCountdownDto, UpdateCountdownDto } from '@backend/countdown/countdown.dto';
import { Countdown, CountdownQueryParams, PaginatedCountdownResponse, CountdownTimeRemaining } from '@backend/countdown/countdown.interface';
import countdownService from '@backend/countdown/countdown.service';
class CountdownController {
  public countdownService = new countdownService();
  public getCountdownStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const statistics = await this.countdownService.countdownStatistics();
      res.status(200).json({ data: statistics, message: 'countdownStatistics' });
    } catch (error) {
      next(error);
    }
  };
  public getCountdowns = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: CountdownQueryParams = {
        pagination: {
          page: req.query.page ? parseInt(req.query.page as string) : 1,
          limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        },
        sort: {
          field: req.query.sortBy as string || 'createdAt',
          order: req.query.sortOrder as 'asc' | 'desc' || 'desc',
        },
        filters: {
          ...(req.query.status && { status: req.query.status as string }),
          ...(req.query.isActive !== undefined && {
            isActive: req.query.isActive === 'true'
          }),
          ...(req.query.search && { search: req.query.search as string }),
        },
      };
      const result: PaginatedCountdownResponse = await this.countdownService.findCountdownsWithFilters(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  public getAllCountdowns = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countdowns: Countdown[] = await this.countdownService.findAllCountdowns();
      res.status(200).json({ data: countdowns, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getCountdownById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countdownId: string = req.params.id;
      const findOneCountdownData: Countdown = await this.countdownService.findCountdownById(countdownId);
      res.status(200).json({ data: findOneCountdownData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public getActiveCountdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeCountdown = await this.countdownService.findActiveCountdown();
      if (!activeCountdown) {
        return res.status(200).json({
          data: null,
          message: 'No active countdown found'
        });
      }
      res.status(200).json({ data: activeCountdown, message: 'activeCountdown' });
    } catch (error) {
      next(error);
    }
  };
  public getActiveCountdownWithTimeRemaining = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.countdownService.getActiveCountdownWithTimeRemaining();
      if (!result) {
        return res.status(404).json({
          data: null,
          message: 'No active countdown found'
        });
      }
      res.status(200).json({ data: result, message: 'activeCountdownWithTimeRemaining' });
    } catch (error) {
      next(error);
    }
  };
  public getTimeRemaining = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countdownId: string = req.params.id;
      const timeRemaining: CountdownTimeRemaining = await this.countdownService.getTimeRemaining(countdownId);
      res.status(200).json({ data: timeRemaining, message: 'timeRemaining' });
    } catch (error) {
      next(error);
    }
  };
  public createCountdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countdownData: CreateCountdownDto = req.body;
      const createCountdownData: Countdown = await this.countdownService.createCountdown(countdownData);
      res.status(201).json({ data: createCountdownData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateCountdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countdownId: string = req.params.id;
      const countdownData: UpdateCountdownDto = req.body;
      const updateCountdownData: Countdown = await this.countdownService.updateCountdown(countdownId, countdownData);
      res.status(200).json({ data: updateCountdownData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteCountdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countdownId: string = req.params.id;
      const deleteCountdownData: Countdown = await this.countdownService.deleteCountdown(countdownId);
      res.status(200).json({ data: deleteCountdownData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public updateExpiredCountdowns = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.countdownService.updateExpiredCountdowns();
      res.status(200).json({ data: null, message: 'expiredCountdownsUpdated' });
    } catch (error) {
      next(error);
    }
  };
  public activateCountdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countdownId: string = req.params.id;
      const activateCountdownData: Countdown = await this.countdownService.activateCountdown(countdownId);
      res.status(200).json({ data: activateCountdownData, message: 'activated' });
    } catch (error) {
      next(error);
    }
  };
  public deactivateAllCountdowns = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.countdownService.deactivateAllCountdowns();
      res.status(200).json({ data: null, message: 'allCountdownsDeactivated' });
    } catch (error) {
      next(error);
    }
  };
}
export default CountdownController;