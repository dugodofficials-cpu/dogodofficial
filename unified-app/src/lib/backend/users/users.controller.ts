import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@backend/users/users.dto';
import { User, UserQueryParams, PaginatedUsersResponse } from '@backend/users/users.interface';
import userService from '@backend/users/users.service';
import s3PublicService from '@backend/utils/s3Public';
import { cleanupTempFiles } from '@backend/middlewares/upload.middleware';
class UsersController {
  public userService = new userService();
  public getUserStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userStatistics: { totalUsers: number } = await this.userService.userStatistics();
      res.status(200).json({ data: userStatistics, message: 'userStatistics' });
    } catch (error) {
      next(error);
    }
  };
  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: UserQueryParams = {
        pagination: {
          page: req.query.page ? parseInt(req.query.page as string) : 1,
          limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        },
        sort: {
          field: req.query.sortBy as string || 'createdAt',
          order: req.query.sortOrder as 'asc' | 'desc' || 'desc',
        },
        filters: {
          ...(req.query.email && { email: req.query.email as string }),
          ...(req.query.firstName && { firstName: req.query.firstName as string }),
          ...(req.query.lastName && { lastName: req.query.lastName as string }),
          ...(req.query.phone && { phone: req.query.phone as string }),
          ...(req.query['address.city'] && { 'address.city': req.query['address.city'] as string }),
          ...(req.query['address.state'] && { 'address.state': req.query['address.state'] as string }),
          ...(req.query['address.country'] && { 'address.country': req.query['address.country'] as string }),
          ...(req.query.country && { country: req.query.country as string }),
          ...(req.query.search && { search: req.query.search as string }),
          ...(req.query.role && { role: req.query.role as string }),
          ...(req.query.status && { status: req.query.status as string }),
        },
      };
      const result: PaginatedUsersResponse = await this.userService.findUsersWithFilters(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const findOneUserData: User = await this.userService.findUserById(userId);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: User = await this.userService.createUser(userData);
      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const userData: CreateUserDto = req.body;
      const updateUserData: User = await this.userService.updateUser(userId, userData);
      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const deleteUserData: User = await this.userService.deleteUser(userId);
      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
  public uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { key } = await s3PublicService.uploadPublicFile(file, `users/${userId}/profile-picture`);
      const updateUserData: User = await this.userService.updateUser(userId, { picture: key });

      cleanupTempFiles(file);
      res.status(200).json({ data: updateUserData, message: 'Profile picture updated' });
    } catch (error) {
      if (req.file) cleanupTempFiles(req.file);
      next(error);
    }
  };
}
export default UsersController;