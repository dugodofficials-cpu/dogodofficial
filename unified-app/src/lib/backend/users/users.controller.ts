import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@backend/users/users.dto';
import { User, UserQueryParams, PaginatedUsersResponse } from '@backend/users/users.interface';
import userService from '@backend/users/users.service';
import s3PublicService from '@backend/utils/s3Public';
import { cleanupTempFiles } from '@backend/middlewares/upload.middleware';
import { RequestWithUser } from '@backend/interfaces/auth.interface';
import { HttpException } from '@backend/exceptions/HttpException';
const PROFILE_PICTURE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;
class UsersController {
  public userService = new userService();
  // A user's own profile picture uploads directly to storage from the
  // browser via a presigned URL, instead of through this Vercel function —
  // the function's request body is capped around 4.5MB at the platform
  // level, which a real phone photo can exceed even under this 5MB limit.
  public getProfilePictureUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const { filename, contentType, sizeBytes } = req.body || {};
      if (!filename || typeof filename !== 'string') {
        throw new HttpException(400, 'filename is required');
      }
      if (!PROFILE_PICTURE_CONTENT_TYPES.includes(contentType)) {
        throw new HttpException(400, `contentType must be one of: ${PROFILE_PICTURE_CONTENT_TYPES.join(', ')}`);
      }
      if (typeof sizeBytes === 'number' && sizeBytes > MAX_PROFILE_PICTURE_BYTES) {
        throw new HttpException(400, `File must be under ${MAX_PROFILE_PICTURE_BYTES / (1024 * 1024)}MB`);
      }
      const safeName = filename.toString().replace(/[^a-zA-Z0-9_.-]/g, '_').slice(-120);
      const key = `users/${userId}/profile-picture/${Date.now()}-${safeName}`;
      const uploadUrl = await s3PublicService.getPresignedUploadUrl(key, contentType);
      res.status(200).json({ data: { key, uploadUrl }, message: 'upload url generated' });
    } catch (error) {
      next(error);
    }
  };
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
  public updateUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const userData: CreateUserDto = req.body;
      // selfOrPermission sets hasElevatedAccess=false when the caller is editing
      // their own record without an admin permission — strip fields a plain user
      // must never be able to set on themselves (role/status escalation).
      if (!(req as any).hasElevatedAccess) {
        delete (userData as Partial<CreateUserDto>).role;
        delete (userData as Partial<CreateUserDto>).status;
      }
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