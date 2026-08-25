import { Router } from 'express';
import UsersController from '@backend/users/users.controller';
import { CreateUserDto, GetUsersQueryDto } from '@backend/users/users.dto';
import { Routes } from '@backend/interfaces/routes.interface';
import validationMiddleware from '@backend/middlewares/validation.middleware';
import handleMulterUpload from '@backend/middlewares/upload.middleware';
import authMiddleware from '@backend/middlewares/auth.middleware';
import { hasPermission } from '@backend/middlewares/permission.middleware';
import { selfOrPermission } from '@backend/middlewares/selfOrPermission.middleware';
import { Permission } from '@backend/roles/roles.interface';
class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, [authMiddleware, hasPermission(Permission.READ_USER)], validationMiddleware(GetUsersQueryDto, 'query'), this.usersController.getUsers);
    this.router.get(`${this.path}/statistics`, [authMiddleware, hasPermission(Permission.READ_USER)], this.usersController.getUserStatistics);
    this.router.get(`${this.path}/:id`, [authMiddleware, selfOrPermission(Permission.READ_USER)], this.usersController.getUserById);
    this.router.post(`${this.path}`, [authMiddleware, hasPermission(Permission.CREATE_USER)], validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.put(`${this.path}/:id`, [authMiddleware, selfOrPermission(Permission.UPDATE_USER)], validationMiddleware(CreateUserDto, 'body', true), this.usersController.updateUser);
    this.router.delete(`${this.path}/:id`, [authMiddleware, hasPermission(Permission.DELETE_USER)], this.usersController.deleteUser);
    this.router.post(`${this.path}/:id/profile-picture`, [authMiddleware, selfOrPermission(Permission.UPDATE_USER)], handleMulterUpload, this.usersController.uploadProfilePicture);
  }
}
export default UsersRoute;