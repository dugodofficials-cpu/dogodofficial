import { Router } from 'express';
import UsersController from '@/modules/users/users.controller';
import { CreateUserDto, GetUsersQueryDto } from '@/modules/users/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import handleMulterUpload from '@middlewares/upload.middleware';
class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, validationMiddleware(GetUsersQueryDto, 'query'), this.usersController.getUsers);
    this.router.get(`${this.path}/statistics`, this.usersController.getUserStatistics);
    this.router.get(`${this.path}/:id`, this.usersController.getUserById);
    this.router.post(`${this.path}`, validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.put(`${this.path}/:id`, validationMiddleware(CreateUserDto, 'body', true), this.usersController.updateUser);
    this.router.delete(`${this.path}/:id`, this.usersController.deleteUser);
    this.router.post(`${this.path}/:id/profile-picture`, handleMulterUpload, this.usersController.uploadProfilePicture);
  }
}
export default UsersRoute;